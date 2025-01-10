// services/movieService.js
import axios from "axios";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const openaiUrl = "https://api.openai.com/v1/embeddings";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Fonction pour générer un embedding pour un texte
export async function getEmbedding(query) {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: query,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error("Erreur lors de la génération de l'embedding");
        console.log(error);
        throw new Error("Erreur lors de la génération de l'embedding");
    }
}

// Fonction pour rechercher des films similaires dans Pinecone
export async function getSimilarMovies(
    query,
    moviesToDiscard,
    genres,
    movie = null
) {
    // console.log("userPreferredMovies :", userPreferredMovies);
    const queryVector = await getEmbedding(query);
    // console.log("Query Vector :", queryVector);
    if (!queryVector) return [];
    try {
        const index = pinecone.index(process.env.PINECONE_INDEX);

        const filters = {};

        moviesToDiscard.length > 0
            ? (filters.title = {
                  $nin: moviesToDiscard,
              })
            : null;
        genres ? (filters.genres = { $in: genres }) : null;

        // console.log("Filtres :", filters);
        let result = await index.query({
            vector: queryVector,
            topK: 10, // Nombre de films les plus similaires
            includeMetadata: true,
            filter: filters,
        });

        let moviesToRerank = result.matches.map((match) => ({
            id: match.id, // L'ID du film
            text: `Titre : ${match.metadata.title} Synopsis : ${
                match.metadata.synopsis
            } / Genres : ${match.metadata.genres.join(
                " "
            )} / Acteurs : ${match.metadata.cast.join(" ")} / Réalisateur : ${
                match.metadata.director
            }`, // Le champ "text" dans les métadonnées (ou un autre champ pertinent)
        }));

        // Récupérer les documents sur l'index
        let rerank_results = await pinecone.inference.rerank(
            "bge-reranker-v2-m3",
            query,
            moviesToRerank,
            { rankFields: ["text"], top_n: 3, return_documents: true }
        );

        // Reconstruire les résultats en fonction du reranking, on devra récupérer quand même les metada sur result car rerank_results ne contient pas les metadatas
        let rerankedMovies = rerank_results.data.map((data) => {
            let id = data.document.id;
            let metadata = result.matches.find(
                (match) => match.id === id
            ).metadata;

            return metadata;
        });

        let moviesToReturn = [];
        for (let i = 0; i < 3; i++) {
            let movie = rerankedMovies[i];
            let movieDetails = {
                title: movie.title,
                genres: movie.genres,
                synopsis: movie.synopsis,
                releaseDate: movie.releaseDate,
                vote_average: movie.vote_average,
                cast: movie.cast,
                director: movie.director,
                posterUrl: movie.posterUrl,
            };
            moviesToReturn.push(movieDetails);
        }

        // Log les films recommandés par le result et les films rerankés
        movie ? console.log("Film : ", movie.title) : null;
        console.log(
            "Films recommandés par le result :",
            result.matches.map((match) => match.metadata.title)
        );
        console.log(
            "Films rerankés :",
            moviesToReturn.map((movie) => movie.title)
        );

        return moviesToReturn;
    } catch (error) {
        console.error("Erreur lors de la recherche dans Pinecone");
        console.log(error);
        throw new Error("Erreur lors de la recherche des films similaires");
    }
}

// Fonction pour générer une explication avec ChatGPT
export async function generateExplanation(
    userPreferences,
    recommendedMovie,
    reason,
    favoriteMovie
) {
    let context;
    if (reason == "mood") {
        context = `
    L'utilisateur est ${
        userPreferences.mood
    } en ce moment et cherche des films pour ${
            userPreferences.age
        }. Il recherche des films qui correspondent à son humeur et à son âge. Il a indiqué aimer les films ${userPreferences.genrePreference
            .map((genre) => genre.label)
            .join(
                ", "
            )}. Explique pourquoi le film suivant serait une bonne recommandation pour lui.`;
    } else if (reason == "genre") {
        context = `L'utilisateur a indiqué aimer le film ${favoriteMovie.title}. Explique pourquoi le film suivant serait une bonne recommandation pour lui.`;
    }
    // Inclure les informations spécifiques au film recommandé
    let movieDetails = `Voici les informations sur le film : 
    - Titre : ${recommendedMovie.title}
    - Genres : ${recommendedMovie.genres.join(", ")}
    - Synopsis : ${recommendedMovie.synopsis}
    - Date de sortie : ${recommendedMovie.releaseDate}
    - Note moyenne : ${recommendedMovie.vote_average}
    - Acteurs : ${recommendedMovie.cast.join(", ")}
    - Réalisateur : ${recommendedMovie.director}`;

    // Récupérer la réponse de ChatGPT, avec un ton plus naturel et descriptif
    const prompt = `
    ${context}
    ${movieDetails}

    ##########

    Objectif : Décrire pourquoi est-ce que ce film serait une bonne recommandation pour cet utilisateur, en tenant compte de ses goûts et de son humeur ? Parlez de ce qui pourrait le captiver, ce qu'il pourrait ressentir, et pourquoi ce film est une bonne option pour lui à ce moment précis. Assure-toi de ne pas révéler d'éléments clés de l'intrigue, pour éviter tout spoil.
    Attention au ton employé, il faut donner envie à l'utilisateur en jouant sur les émotions et les attentes mais ne sois pas trop formel.
    Tu feras un seul paragraphe de 200 carractères maximum (80 tokens grand maximum). Attention aussi à la manière dont tu écris, il ne faut pas trop en faire et il faut rester nature, comme un ami qui recommande un film à un autre ami.
  `;

    try {
        // const response = await openai.chat.completions.create({
        //     model: "gpt-4o-mini",
        //     max_tokens: 100,
        //     messages: [
        //         {
        //             role: "system",
        //             content: prompt,
        //         },
        //     ],
        //     temperature: 0.7,
        // });

        // return response.choices[0].message.content;
        return recommendedMovie.synopsis;
    } catch (error) {
        console.error("Erreur lors de l'utilisation de l'API ChatGPT", error);
        return "Aucune explication disponible.";
    }
}
