import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";

function requireEnvironmentVariable(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`La variable d'environnement ${name} est manquante.`);
    }

    return value;
}

export function isAiRecommendationConfigured() {
    return Boolean(
        process.env.OPENAI_API_KEY &&
            process.env.PINECONE_API_KEY &&
            process.env.PINECONE_INDEX
    );
}

function createClients() {
    return {
        openai: new OpenAI({
            apiKey: requireEnvironmentVariable("OPENAI_API_KEY"),
        }),
        pinecone: new Pinecone({
            apiKey: requireEnvironmentVariable("PINECONE_API_KEY"),
        }),
    };
}

export async function getEmbedding(query) {
    const { openai } = createClients();
    const response = await openai.embeddings.create({
        model:
            process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-ada-002",
        input: query,
    });

    return response.data[0].embedding;
}

export async function getSimilarMovies(
    query,
    moviesToDiscard,
    genres,
    favoriteMovie = null
) {
    const queryVector = await getEmbedding(query);
    const { pinecone } = createClients();
    const index = pinecone.index(
        requireEnvironmentVariable("PINECONE_INDEX")
    );
    const filter = {};

    if (moviesToDiscard.length > 0) {
        filter.title = { $nin: moviesToDiscard };
    }

    if (genres?.length > 0) {
        filter.genres = { $in: genres };
    }

    const result = await index.query({
        vector: queryVector,
        topK: 10,
        includeMetadata: true,
        filter,
    });

    const documents = result.matches.map((match) => ({
        id: match.id,
        text: [
            `Titre : ${match.metadata.title}`,
            `Synopsis : ${match.metadata.synopsis}`,
            `Genres : ${match.metadata.genres.join(" ")}`,
            `Acteurs : ${match.metadata.cast.join(" ")}`,
            `Réalisateur : ${match.metadata.director}`,
        ].join(" / "),
    }));

    const reranked = await pinecone.inference.rerank(
        "bge-reranker-v2-m3",
        query,
        documents,
        { rankFields: ["text"], top_n: 3, return_documents: true }
    );

    return reranked.data.map(({ document }) => {
        const metadata = result.matches.find(
            (match) => match.id === document.id
        )?.metadata;

        if (!metadata) {
            throw new Error("Métadonnées de film introuvables après reranking.");
        }

        return {
            title: metadata.title,
            genres: metadata.genres,
            synopsis: metadata.synopsis,
            releaseDate: metadata.releaseDate,
            vote_average: metadata.vote_average,
            cast: metadata.cast,
            director: metadata.director,
            posterUrl: metadata.posterUrl,
            reason: favoriteMovie ? "favorite" : "mood",
            similarMovie: favoriteMovie?.title,
            explanation: metadata.synopsis,
        };
    });
}
