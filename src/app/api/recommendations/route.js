import { NextResponse } from "next/server";
import {
    getSimilarMovies,
    isAiRecommendationConfigured,
} from "@/services/movieService";
import {
    recommendLocally,
    validatePreferences,
} from "@/services/localRecommendationService";
import moviesData from "../movies_with_details.json";

function buildAiQuery(preferences, favoriteMovie = null) {
    if (favoriteMovie) {
        return `Recommande des films proches de ${favoriteMovie.title}, en tenant compte de son synopsis, de son ton et de ses genres : ${favoriteMovie.synopsis}`;
    }

    const genres = preferences.genrePreference
        .map((genre) => genre.value)
        .join(", ");

    return `Recommande des films adaptés à une personne ${preferences.age}, d'humeur ${preferences.mood}, qui apprécie les genres suivants : ${genres}.`;
}

async function recommendWithAi(preferences) {
    const favoriteMovies = preferences.moviePreference
        .map((option) => moviesData.find((movie) => movie.id === option.value))
        .filter(Boolean);
    const genres = preferences.genrePreference.map((genre) => genre.value);
    const excludedTitles = [
        ...favoriteMovies.map((movie) => movie.title),
        ...(preferences.alreadySeen || []),
    ];
    const recommendationGroups = await Promise.all([
        ...favoriteMovies.map((movie) =>
            getSimilarMovies(
                buildAiQuery(preferences, movie),
                excludedTitles,
                movie.genres,
                movie
            )
        ),
        getSimilarMovies(
            buildAiQuery(preferences),
            excludedTitles,
            genres
        ),
    ]);
    const unique = new Map();

    recommendationGroups.flat().forEach((movie) => {
        if (!unique.has(movie.title)) {
            unique.set(movie.title, movie);
        }
    });

    return [...unique.values()];
}

export async function POST(request) {
    try {
        const preferences = await request.json();

        if (!validatePreferences(preferences)) {
            return NextResponse.json(
                { error: "Préférences incomplètes ou invalides." },
                { status: 400 }
            );
        }

        if (!isAiRecommendationConfigured()) {
            return NextResponse.json({
                mode: "local",
                recommendations: recommendLocally(preferences, moviesData),
            });
        }

        const recommendations = await recommendWithAi(preferences);
        return NextResponse.json({ mode: "ai", recommendations });
    } catch (error) {
        console.error("Échec de la recommandation :", error.message);
        return NextResponse.json(
            {
                error: "La recommandation est temporairement indisponible.",
            },
            { status: 500 }
        );
    }
}
