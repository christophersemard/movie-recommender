"use client";
import React, { useState, useEffect } from "react";

const MovieSlider = ({ movies, setMovies, handleReshowQuestionnaire }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [alreadySeen, setAlreadySeen] = useState(() => {
        if (typeof window === "undefined") {
            return [];
        }

        try {
            return JSON.parse(localStorage.getItem("alreadySeen")) || [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        // Sauvegarder la liste des films déjà vus dans localStorage
        localStorage.setItem("alreadySeen", JSON.stringify(alreadySeen));
    }, [alreadySeen]);

    const handleNextMovie = () => {
        // Passer au film suivant
        if (currentIndex < movies.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleAlreadySeen = (movieTitle) => {
        // Ajouter le film à la liste des films déjà vus
        if (!alreadySeen.includes(movieTitle)) {
            setAlreadySeen([...alreadySeen, movieTitle]);
            console.log("Film ajouté à la liste des films déjà vus");
            // Passer au film suivant
            setMovies(movies.filter((movie) => movie.title !== movieTitle));
            handleNextMovie();
            // Retirer le film de la liste des recommandations
        }
    };

    const movie = movies[currentIndex];

    return (
        <div
            className="relative w-full h-screen text-textPrimary  p-20 px-32
       bg-cover bg-center shadow-lg"
            style={{ backgroundImage: `url(${movie.posterUrl})` }}
        >
            <div className="absolute inset-0 bg-black opacity-70"></div>
            <div className="mb-8 flex justify-between items-center z-10 relative">
                <h2 className="text-4xl font-bold">{movie.title}</h2>
                <div className="">
                    {movie.similarMovie ? (
                        <>
                            Similaire au film{" "}
                            <span className="text-lg text-accentYellow font-medium">
                                {movie.similarMovie}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-accentYellow font-medium">
                            Recommandé pour vous
                        </span>
                    )}
                </div>
            </div>
            <div className=" w-full h-full flex items-center z-10 relative">
                {/* Container du slider */}
                <div className="flex w-full h-full p-4  pb-32">
                    {/* Image à gauche */}
                    <div
                        className="w-1/4 h-full bg-cover bg-center shadow-lg"
                        style={{ backgroundImage: `url(${movie.posterUrl})` }}
                    ></div>

                    {/* Détails du film à droite */}
                    <div className="w-3/4 flex flex-col justify-between pl-8">
                        <div>
                            <div className="mb-8 flex justify-between items-start">
                                <div>
                                    {/* Année de sortie */}
                                    <p>
                                        Année de sortie :{" "}
                                        <strong>
                                            {movie.releaseDate.slice(0, 4)}
                                        </strong>
                                    </p>

                                    {/* Réalisateur */}
                                    <p className=" mt-2">
                                        Réalisateur :{" "}
                                        <strong> {movie.director}</strong>
                                    </p>

                                    {/* Acteurs */}
                                    <div className="mt-2 flex items-center space-x-2">
                                        <p>Acteurs : </p>
                                        <div className="flex items-center space-x-2">
                                            {movie.cast.map((actor, index) => (
                                                <p key={index}>{actor}</p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Genres */}
                                    <div className="mt-2 flex items-center space-x-2">
                                        <p>Genres : </p>
                                        <div className="flex items-center space-x-2  gap-1">
                                            {movie.genres.map(
                                                (genre, index) => (
                                                    <p
                                                        className="bg-accentDark px-2"
                                                        key={index}
                                                    >
                                                        {genre}
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center space-x-2">
                                    <div
                                        className={`w-10 h-10 text-2xl p-8 flex items-center justify-center  text-white font-bold ${
                                            movie.vote_average > 7
                                                ? "bg-green-500"
                                                : movie.vote_average < 5
                                                ? "bg-red-500"
                                                : "bg-orange-500"
                                        }`}
                                    >
                                        {movie.vote_average.toFixed(1)}
                                    </div>
                                </div>
                            </div>

                            <p className="text-lg ">{movie.synopsis}</p>

                            {/* Encarts */}
                            <div className="mt-8 bg-black bg-opacity-40 p-4  border-l-4 border-accentYellow">
                                <p className="text-lg font-medium">
                                    Notre avis
                                </p>
                                <p className="text-sm">{movie.explanation}</p>
                            </div>
                        </div>

                        {/* Informations supplémentaires */}
                        <div className="mt-2 flex justify-end items-center">
                            {/* Boutons en bas */}
                            <div className="space-x-4">
                                <button
                                    className="btn-accentYellow-outline "
                                    onClick={handleReshowQuestionnaire}
                                >
                                    Retour au questionnaire
                                </button>
                                <button
                                    className="btn-accentYellow-outline "
                                    onClick={handleNextMovie}
                                >
                                    Pas intéressé
                                </button>
                                <button
                                    className="btn-accentYellow "
                                    onClick={() =>
                                        handleAlreadySeen(movie.title)
                                    }
                                >
                                    Déjà vu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {currentIndex > 0 && (
                <button
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    className="absolute top-1/2 left-8 text-4xl btn-darkAccent"
                >
                    &lt;
                </button>
            )}

            {/* Flèche droite pour passer au film suivant */}
            {currentIndex < movies.length - 1 && (
                <button
                    onClick={handleNextMovie}
                    className="absolute top-1/2 right-8 text-4xl btn-darkAccent"
                >
                    &gt;
                </button>
            )}
        </div>
    );
};

export default MovieSlider;
