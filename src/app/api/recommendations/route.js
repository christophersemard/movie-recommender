// pages/api/recommandations.js
import { NextResponse } from "next/server";
import { getSimilarMovies, generateExplanation } from "@/services/movieService"; // Importer les fonctions du service
import moviesData from "../movies_with_details.json"; // Importer les films déjà récupérés

export async function POST(req) {
    try {
        const userPreferences = await req.json();

        // console.log("Préférences de l'utilisateur", userPreferences);

        let preferedMovies = userPreferences.moviePreference.map((movie) =>
            moviesData.find((m) => m.id === movie.value)
        );

        let preferedGenres = [
            ...new Set([
                ...userPreferences.genrePreference.map((genre) => genre.value),
            ]),
        ];

        let moviesToDiscard = [];
        for (let movie of preferedMovies) {
            moviesToDiscard.push(movie.title);
        }
        for (let movie of userPreferences.alreadySeen) {
            moviesToDiscard.push(movie);
        }

        let similarFavoriteMovies = [];
        // Créer un tableau de promesses
        const recommendationMoviesPromises = preferedMovies.map(
            async (movie) => {
                const query = `
                Contexte :
                Tu recherches des recommandations de films basées sur un film existant. Le film en question a un genre, un ton, et un style particulier, ainsi qu’une intrigue et un univers distincts. Tu veux des suggestions qui correspondent à ces éléments pour élargir ton expérience cinématographique.

                Le film existant a pour synopsis : "${movie.synopsis}".

                ##########

                Objectif :
                Recommande des films similaires à "${movie.title}".
                Je cherche des films qui ressemblent à ce film en termes de genre, de ton et de style.
                Par exemple si on aime Interstellar, on aimera d'autres films de science-fiction se déroulant dans l'espace ou d'autres films du même réalisateur Christopher Nolan si les films sont dans le même genre.
                Assure-toi de bien prendre en compte l'intrigue, l'ambiance et l'univers du film pour les recommandations.
                `;

                const similarMovies = await getSimilarMovies(
                    query,
                    moviesToDiscard,
                    movie.genres,
                    movie
                );
                similarFavoriteMovies.push(similarMovies);
            }
        );

        // Attendre que toutes les promesses dans recommendationPromises soient résolues
        await Promise.all(recommendationMoviesPromises);

        const query = `
                Contexte :
                Tu recherches des recommandations de films basées sur un film existant. Tu veux aux critères suivants qui correspondent à ces éléments pour élargir ton expérience cinématographique.

                Voici les critères de l'utilisateur :
                - Âge : ${userPreferences.age}
                - Humeur : ${userPreferences.mood}
                - Genres préférés : ${preferedGenres.join(", ")}

                ##########

                Objectif :
                Je cherche des films qui correspondent à ces critères et qui pourraient plaire à l'utilisateur. 
                Assure-toi de prendre en compte l'âge de l'utilisateur, son humeur et surtout ses genres favoris pour la recommandation, on ne veut par exemple pas de film d'horreur si on on aime les films d'animation.
                `;
        let similarMoviesMood = await getSimilarMovies(
            query,
            moviesToDiscard,
            preferedGenres
        );
        // Pour chaque film similaire, générer une explication avec ChatGPT
        let moviesRecommendations = [];
        const recommendationPromises = [];

        // Pour les films similaires de préférence
        for (let index = 0; index < similarFavoriteMovies.length; index++) {
            const movies = similarFavoriteMovies[index];
            for (let movie of movies) {
                recommendationPromises.push(
                    generateExplanation(
                        userPreferences,
                        movie,
                        "favorite",
                        preferedMovies[index]
                    ).then((explanation) => {
                        movie.explanation = explanation;
                        movie.reason = "favorite";
                        movie.similarMovie = preferedMovies[index].title;
                        moviesRecommendations.push(movie);
                    })
                );
            }
        }

        // Pour les films similaires à l'humeur
        for (let movie of similarMoviesMood) {
            recommendationPromises.push(
                generateExplanation(userPreferences, movie, "mood").then(
                    (explanation) => {
                        movie.explanation = explanation;
                        movie.reason = "mood";
                        moviesRecommendations.push(movie);
                    }
                )
            );
        }

        // Attendre que toutes les promesses soient résolues
        await Promise.all(recommendationPromises);

        // Check si on a plsuieurs recommandations en double, si c'est le cas on les enlève
        const uniqueMovies = moviesRecommendations.filter(
            (movie, index, self) =>
                index === self.findIndex((t) => t.title === movie.title)
        );

        const randomizedMovies = uniqueMovies.sort(() => Math.random() - 0.5);

        return NextResponse.json({
            recommendations: randomizedMovies,
        });
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            {
                error: e.message || "Une erreur est survenue.",
                message: "Veuillez réessayer plus tard.",
            },
            { status: 500 }
        );
    }
}
