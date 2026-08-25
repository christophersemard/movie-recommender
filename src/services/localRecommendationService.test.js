import assert from "node:assert/strict";
import test from "node:test";
import {
    recommendLocally,
    validatePreferences,
} from "./localRecommendationService.js";

const movies = [
    {
        id: 1,
        title: "Film favori",
        genres: ["Science-Fiction"],
        director: "A",
        cast: ["X"],
        vote_average: 8,
    },
    {
        id: 2,
        title: "Proche",
        genres: ["Science-Fiction", "Aventure"],
        director: "A",
        cast: ["X"],
        vote_average: 7,
    },
    {
        id: 3,
        title: "Éloigné",
        genres: ["Drame"],
        director: "B",
        cast: [],
        vote_average: 9,
    },
];

const preferences = {
    moviePreference: [{ value: 1 }],
    genrePreference: [{ value: "Science-Fiction" }],
    mood: "plutôt bien, heureux",
    age: "adulte",
    alreadySeen: [],
};

test("valide un questionnaire complet", () => {
    assert.equal(validatePreferences(preferences), true);
    assert.equal(validatePreferences({}), false);
});

test("classe les films proches et exclut le film favori", () => {
    const recommendations = recommendLocally(preferences, movies, 2);

    assert.equal(recommendations[0].title, "Proche");
    assert.equal(recommendations.some((movie) => movie.id === 1), false);
});

test("exclut les films déjà vus", () => {
    const recommendations = recommendLocally(
        { ...preferences, alreadySeen: ["Proche"] },
        movies,
        2
    );

    assert.equal(recommendations.some((movie) => movie.title === "Proche"), false);
});
