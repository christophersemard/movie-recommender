const FAMILY_GENRES = new Set(["Animation", "Familial", "Aventure"]);

function valuesOf(options) {
    return Array.isArray(options)
        ? options.map((option) => option?.value).filter(Boolean)
        : [];
}

export function validatePreferences(preferences) {
    if (!preferences || typeof preferences !== "object") {
        return false;
    }

    return (
        valuesOf(preferences.moviePreference).length > 0 &&
        valuesOf(preferences.genrePreference).length > 0 &&
        typeof preferences.mood === "string" &&
        preferences.mood.length > 0 &&
        ["enfant", "adolescent", "adulte"].includes(preferences.age)
    );
}

function scoreMovie(movie, favoriteMovies, preferredGenres, mood, age) {
    const favoriteGenres = new Set(
        favoriteMovies.flatMap((favorite) => favorite.genres || [])
    );
    const favoriteDirectors = new Set(
        favoriteMovies.map((favorite) => favorite.director).filter(Boolean)
    );
    const favoriteCast = new Set(
        favoriteMovies.flatMap((favorite) => favorite.cast || [])
    );

    let score = Number(movie.vote_average || 0) / 10;
    score += movie.genres.filter((genre) => preferredGenres.has(genre)).length * 5;
    score += movie.genres.filter((genre) => favoriteGenres.has(genre)).length * 3;
    score += favoriteDirectors.has(movie.director) ? 3 : 0;
    score += movie.cast.filter((actor) => favoriteCast.has(actor)).length;

    if (mood.includes("triste") && movie.genres.includes("Comédie")) {
        score += 2;
    }

    if (mood.includes("heureux") && movie.genres.includes("Aventure")) {
        score += 1.5;
    }

    if (age === "enfant" && movie.genres.some((genre) => FAMILY_GENRES.has(genre))) {
        score += 4;
    }

    if (age === "enfant" && movie.genres.includes("Horreur")) {
        score -= 20;
    }

    return score;
}

export function recommendLocally(preferences, movies, limit = 9) {
    const favoriteIds = new Set(valuesOf(preferences.moviePreference));
    const preferredGenres = new Set(valuesOf(preferences.genrePreference));
    const alreadySeen = new Set(
        Array.isArray(preferences.alreadySeen) ? preferences.alreadySeen : []
    );
    const favoriteMovies = movies.filter((movie) => favoriteIds.has(movie.id));
    const favoriteTitles = new Set(favoriteMovies.map((movie) => movie.title));

    return movies
        .filter(
            (movie) =>
                !favoriteTitles.has(movie.title) && !alreadySeen.has(movie.title)
        )
        .map((movie) => ({
            movie,
            score: scoreMovie(
                movie,
                favoriteMovies,
                preferredGenres,
                preferences.mood,
                preferences.age
            ),
        }))
        .sort(
            (left, right) =>
                right.score - left.score || left.movie.title.localeCompare(right.movie.title)
        )
        .slice(0, limit)
        .map(({ movie }) => ({
            ...movie,
            reason: "local",
            explanation:
                "Sélection locale basée sur vos genres, vos films favoris et la note moyenne.",
        }));
}
