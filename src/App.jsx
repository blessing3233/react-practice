
import { useEffect, useState } from 'react'
import Search from './component/search.jsx'
import Spinner from './component/spinner.jsx'

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const App = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const query = searchTerm.trim()

    if (!query) {
      setMovies([])
      setErrorMessage('')
      setIsLoading(false)
      return
    }

    const controller = new AbortController()

    const fetchMovies = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        if (!API_KEY) {
          throw new Error(
            'TMDB API key is missing. Add VITE_TMDB_API_KEY to .env.local.'
          )
        }

        const response = await fetch(
          `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`,
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${API_KEY}`,
            },
            signal: controller.signal,
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.status_message ||
              `Movie search failed (${response.status}).`
          )
        }

        setMovies(Array.isArray(data.results) ? data.results : [])
      } catch (error) {
        if (!controller.signal.aborted) {
          const details =
            error instanceof Error ? error.message : ''

          const message = details
            ? `Failed to fetch movies. ${details}`
            : 'Failed to fetch movies. Please try again.'

          setMovies([])
          setErrorMessage(message)
          window.alert(message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchMovies()

    return () => controller.abort()
  }, [searchTerm])

  return (
    <main>
      <div className="wrapper">
        <header>
          <img src="/BG .png" alt="" />
          <img src="/hero-img.png" alt="" />

          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
        </header>

        <Search
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {searchTerm.trim() && (
          <section className="all-movies" aria-live="polite">
            <h2>All Movies</h2>

            {isLoading && <Spinner />}

            {!isLoading && errorMessage && (
              <p className="movie-message movie-error" role="alert">
                {errorMessage}
              </p>
            )}

            {!isLoading && !errorMessage && movies.length === 0 && (
              <p className="movie-message">
                No movies found. Try another search.
              </p>
            )}

            {!isLoading && !errorMessage && movies.length > 0 && (
              <ul>
                {movies.map((movie) => (
                  <li className="movie-card" key={movie.id}>
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : '/No-Poster.png'
                      }
                      alt={`${movie.title} poster`}
                    />

                    <h3>{movie.title}</h3>

                    <div className="content">
                      <span className="rating">
                        <p>
                          {typeof movie.vote_average === 'number'
                            ? movie.vote_average.toFixed(1)
                            : 'N/A'}
                        </p>
                      </span>

                      {movie.release_date && (
                        <span className="year">
                          {movie.release_date.slice(0, 4)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export default App
