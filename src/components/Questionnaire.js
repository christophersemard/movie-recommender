"use client";
import Select from "react-select";
import { useEffect, useState } from "react";
import axios from "axios";

const moodOptions = [
    { value: "très triste, pleurs, depression", label: "😭" },
    { value: "triste, maussade, pas en forme", label: "😞" },
    { value: "neutre, rien de particulier à signaler", label: "😐" },
    { value: "plutôt bien, heureux", label: "🙂" },
    { value: "très content, heureux, ravi", label: "😁" },
];

const ageOptions = [
    { value: "enfant", label: "👶", label2: "Enfant" },
    { value: "adolescent", label: "👦", label2: "Adolescent" },
    { value: "adulte", label: "👨‍🦳", label2: "Adulte" },
];

const Questionnaire = ({ onSubmit }) => {
    const [moviePreference, setMoviePreference] = useState([]);
    const [mood, setMood] = useState("");
    const [age, setAge] = useState("");
    const [genrePreference, setGenrePreference] = useState("");

    // Dans le composant Questionnaire
    const [genres, setGenres] = useState([]);
    const [movies, setMovies] = useState([]);

    // Styles personnalisés pour react-select
    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: "rgba(20,20,20,0.5)", // Fond sombre
            borderColor: "#202020", // Bordure jaune/orangé
            padding: "6px",
            borderRadius: "0px",
        }),
        input: (provided) => ({
            ...provided,
            color: "#fff", // Texte blanc
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#888", // Texte du placeholder gris clair
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: "#333", // Fond du menu déroulant sombre
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#FFB84D" : "transparent", // Couleur de fond sélectionnée
            color: state.isSelected ? "black" : "white", // Couleur du texte selon l'état
            cursor: "pointer",
            "&:hover": {
                backgroundColor: "#444", // Fond légèrement plus clair quand survolé
            },
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#FFB84D",
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: "black",
            fontWeight: 500,
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: "black",
            ":hover": {
                backgroundColor: "red",
                color: "white",
            },
        }),
    };

    useEffect(() => {
        // Appel à l'API pour récupérer les genres
        axios
            .get("/api/genres")
            .then((response) => {
                setGenres(response.data);
            })
            .catch((error) =>
                console.error(
                    "Erreur lors de la récupération des genres",
                    error
                )
            );

        // Appel à l'API pour récupérer la liste des films
        axios
            .get("/api/movies")
            .then((response) => {
                setMovies(response.data);
            })
            .catch((error) =>
                console.error("Erreur lors de la récupération des films", error)
            );
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Récupérer les films déjà vus dans le localStorage
        const alreadySeen =
            JSON.parse(localStorage.getItem("alreadySeen")) || [];
        onSubmit({ moviePreference, mood, genrePreference, age, alreadySeen });
    };
    return (
        <div
            className="relative w-full h-screen text-textPrimary  p-20 px-24
       bg-cover bg-center shadow-lg"
            style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/w500/1pnigkWWy8W032o9TKDneBa3eVK.jpg)`,
            }}
        >
            <div className="absolute inset-0 bg-black opacity-70"></div>
            <form
                onSubmit={handleSubmit}
                className="p-8 bg-background bg-opacity-30  shadow-lg max-w-4xl mx-auto  space-y-6 relative z-10"
            >
                <h1 className="text-xl font-medium text-textPrimary mb-4 text-center">
                    Salut ! On va commencer par quelques questions pour mieux
                    connaitre tes goûts !
                </h1>
                <hr></hr>

                {/* Sélecteur de film préféré avec autocomplétion et sélection multiple */}
                <div className="mb-4">
                    <label className="block text-lg mb-4 text-textPrimary font-medium">
                        Quels sont tes films préférés ?
                    </label>
                    <Select
                        required={true}
                        isMulti
                        value={moviePreference}
                        onChange={setMoviePreference}
                        options={movies.map((movie) => ({
                            value: movie.id,
                            label: movie.title,
                        }))}
                        className="w-full"
                        placeholder="Choisis tes films préférés !"
                        styles={customSelectStyles}
                        isOptionDisabled={() => moviePreference.length >= 3}
                    />
                </div>

                {/* Genre préféré */}
                <div className="mb-4">
                    <label className="block text-lg mb-4 text-textPrimary font-medium">
                        Quels genres de film tu préfères ?
                    </label>
                    <Select
                        required={true}
                        isMulti
                        value={genrePreference}
                        onChange={setGenrePreference}
                        options={genres.map((genre) => ({
                            value: genre,
                            label: genre,
                        }))}
                        className="w-full"
                        placeholder="Choisis tes genres préférés !"
                        styles={customSelectStyles}
                        isOptionDisabled={() => genrePreference.length >= 3}
                    />
                </div>

                <div className="flex items-center justify-between gap-8">
                    {/* Sélection de l'humeur avec emojis */}
                    <div className="mb-4">
                        <label className="block text-lg mb-4 text-textPrimary font-medium">
                            Comment tu te sens en ce moment ?
                        </label>
                        <div className="flex space-x-4">
                            {moodOptions.map((moodOption) => (
                                <label
                                    key={moodOption.value}
                                    className={`cursor-pointer ${
                                        mood === moodOption.value
                                            ? "filter saturate-100"
                                            : "filter saturate-0"
                                    }`}
                                >
                                    <input
                                        required={true}
                                        type="radio"
                                        name="mood"
                                        value={moodOption.value}
                                        checked={mood === moodOption.value}
                                        onChange={() =>
                                            setMood(moodOption.value)
                                        }
                                        className="hidden text-2xl"
                                    />
                                    <span className="text-3xl">
                                        {moodOption.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Sélection de l'age (enfant, ado, adulte)'*/}
                    <div className="mb-4 w-3/5">
                        <label className="block text-lg mb-4 text-textPrimary font-medium">
                            Tu préfères regarder des films pour ?
                        </label>
                        <div className="flex space-x-8 ">
                            {ageOptions.map((ageOption) => (
                                <label
                                    key={ageOption.value}
                                    className={`cursor-pointer flex items-center r ${
                                        age === ageOption.value
                                            ? "filter saturate-100"
                                            : "filter saturate-0"
                                    }`}
                                >
                                    <input
                                        required={true}
                                        type="radio"
                                        name="age"
                                        value={ageOption.value}
                                        checked={age === ageOption.value}
                                        onChange={() => setAge(ageOption.value)}
                                        className="hidden text-xl "
                                    />
                                    <span className="text-3xl">
                                        {ageOption.label}{" "}
                                    </span>
                                    <span className="text-md">
                                        {ageOption.label2}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <hr></hr>

                <button
                    type="submit"
                    className="w-full btn-accentYellow-outline"
                >
                    Soumettre et voir les recommandations
                </button>
            </form>
        </div>
    );
};

export default Questionnaire;
