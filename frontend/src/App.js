import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Header Component
function Header() {
  return (
    <header className="bg-primary border-b border-gray-800 sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-accentDark rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">⚽</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">cevix</h1>
            <p className="text-xs text-accent">Pronósticos de Fútbol</p>
          </div>
        </Link>
      </div>
    </header>
  );
}

// Loading Component
function Loading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="loading-spinner"></div>
    </div>
  );
}

// Home Page - Leagues Grid
function HomePage() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/leagues`);
      setLeagues(response.data.leagues);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">Ligas de Fútbol</h2>
          <p className="text-xl text-gray-400">Selecciona una liga para ver partidos y pronósticos</p>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => (
              <div
                key={league.id}
                className="league-card"
                onClick={() => navigate(`/league/${league.id}`)}
                data-testid={`league-card-${league.id}`}
              >
                <div className="league-icon">
                  <span>{league.logo}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{league.name}</h3>
                <p className="text-gray-400 text-sm mb-1">{league.country}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="badge badge-info">{league.season}</span>
                  <span className="text-accent font-semibold flex items-center">
                    Ver partidos →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// League Matches Page
function LeaguePage() {
  const { leagueId } = useParams();
  const [matches, setMatches] = useState([]);
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, finished
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeagueData();
  }, [leagueId]);

  const fetchLeagueData = async () => {
    try {
      const [leaguesResponse, matchesResponse] = await Promise.all([
        axios.get(`${API_URL}/api/leagues`),
        axios.get(`${API_URL}/api/leagues/${leagueId}/matches`)
      ]);
      
      const currentLeague = leaguesResponse.data.leagues.find(l => l.id === leagueId);
      setLeague(currentLeague);
      setMatches(matchesResponse.data.matches);
    } catch (error) {
      console.error('Error fetching league data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'upcoming') return match.status === 'SCHEDULED';
    if (filter === 'finished') return match.status === 'FINISHED';
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-primary">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="mb-6 text-accent hover:text-accentDark flex items-center space-x-2 transition-colors"
          data-testid="back-button"
        >
          <span>←</span>
          <span>Volver a ligas</span>
        </button>

        {league && (
          <div className="bg-secondary rounded-xl p-6 mb-8 border border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accentDark rounded-xl flex items-center justify-center text-4xl shadow-lg">
                {league.logo}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{league.name}</h2>
                <p className="text-gray-400">{league.country} • {league.season}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all' ? 'bg-accent text-white' : 'bg-secondary text-gray-400 hover:bg-gray-700'
            }`}
            data-testid="filter-all"
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === 'upcoming' ? 'bg-accent text-white' : 'bg-secondary text-gray-400 hover:bg-gray-700'
            }`}
            data-testid="filter-upcoming"
          >
            Próximos
          </button>
          <button
            onClick={() => setFilter('finished')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === 'finished' ? 'bg-accent text-white' : 'bg-secondary text-gray-400 hover:bg-gray-700'
            }`}
            data-testid="filter-finished"
          >
            Finalizados
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className="match-card"
                onClick={() => navigate(`/match/${match.id}`)}
                data-testid={`match-card-${match.id}`}
              >
                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-3xl">{match.home_logo}</span>
                    <span className="text-lg font-semibold text-white">{match.home_team}</span>
                  </div>

                  {/* Score or VS */}
                  <div className="flex flex-col items-center mx-8">
                    {match.status === 'FINISHED' ? (
                      <div className="flex space-x-4 text-2xl font-bold text-white">
                        <span>{match.home_score}</span>
                        <span className="text-gray-500">-</span>
                        <span>{match.away_score}</span>
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-accent">VS</div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">{formatDate(match.date)}</div>
                    <span className={`badge mt-2 ${
                      match.status === 'FINISHED' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {match.status === 'FINISHED' ? 'Finalizado' : 'Próximo'}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center space-x-3 flex-1 justify-end">
                    <span className="text-lg font-semibold text-white">{match.away_team}</span>
                    <span className="text-3xl">{match.away_logo}</span>
                  </div>
                </div>

                {/* Prediction Teaser */}
                {match.status === 'SCHEDULED' && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button className="text-accent hover:text-accentDark font-semibold text-sm flex items-center space-x-2">
                      <span>Ver pronóstico</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Match Detail with Prediction
function MatchPage() {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatchData();
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      // Extract league ID from match ID
      const leagueId = matchId.split('_')[0];
      
      const [matchesResponse, predictionResponse] = await Promise.all([
        axios.get(`${API_URL}/api/leagues/${leagueId}/matches`),
        axios.get(`${API_URL}/api/matches/${matchId}/prediction`)
      ]);
      
      const currentMatch = matchesResponse.data.matches.find(m => m.id === matchId);
      setMatch(currentMatch);
      setPrediction(predictionResponse.data);
    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary">
        <Header />
        <Loading />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-primary">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl text-white">Partido no encontrado</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 text-accent hover:text-accentDark flex items-center space-x-2 transition-colors"
          data-testid="back-button-match"
        >
          <span>←</span>
          <span>Volver</span>
        </button>

        {/* Match Header */}
        <div className="bg-secondary rounded-xl p-8 mb-8 border border-gray-700">
          <div className="text-center mb-6">
            <span className={`badge ${
              match.status === 'FINISHED' ? 'badge-success' : 'badge-warning'
            }`}>
              {match.status === 'FINISHED' ? 'Finalizado' : 'Próximo'}
            </span>
            <p className="text-gray-400 mt-2">{formatDate(match.date)}</p>
          </div>

          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1">
              <span className="text-6xl mb-4">{match.home_logo}</span>
              <h3 className="text-2xl font-bold text-white text-center">{match.home_team}</h3>
            </div>

            {/* Score or VS */}
            <div className="flex flex-col items-center mx-8">
              {match.status === 'FINISHED' ? (
                <div className="flex space-x-6 text-5xl font-bold text-white">
                  <span>{match.home_score}</span>
                  <span className="text-gray-500">-</span>
                  <span>{match.away_score}</span>
                </div>
              ) : (
                <div className="text-4xl font-bold text-accent">VS</div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1">
              <span className="text-6xl mb-4">{match.away_logo}</span>
              <h3 className="text-2xl font-bold text-white text-center">{match.away_team}</h3>
            </div>
          </div>
        </div>

        {/* Prediction Section */}
        {prediction && match.status === 'SCHEDULED' && (
          <div className="bg-secondary rounded-xl p-8 border border-gray-700">
            <h3 className="text-3xl font-bold text-white mb-6 text-center">Pronóstico</h3>
            
            {/* Winner Prediction */}
            <div className="bg-primary rounded-lg p-6 mb-6 border border-accent">
              <div className="text-center">
                <p className="text-gray-400 mb-2">Resultado más probable</p>
                <h4 className="text-3xl font-bold text-accent mb-2">{prediction.predicted_winner}</h4>
                <span className={`badge ${
                  prediction.confidence === 'Alta' ? 'badge-success' : 'badge-warning'
                }`}>
                  Confianza: {prediction.confidence}
                </span>
              </div>
            </div>

            {/* Probability Bars */}
            <div className="space-y-4 mb-6">
              {/* Home Win */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-semibold">{match.home_team} gana</span>
                  <span className="text-accent font-bold">{(prediction.home_win_prob * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-primary rounded-full h-3 overflow-hidden">
                  <div 
                    className="prediction-bar bg-gradient-to-r from-green-500 to-green-400"
                    style={{ width: `${prediction.home_win_prob * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Draw */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-semibold">Empate</span>
                  <span className="text-accent font-bold">{(prediction.draw_prob * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-primary rounded-full h-3 overflow-hidden">
                  <div 
                    className="prediction-bar bg-gradient-to-r from-yellow-500 to-yellow-400"
                    style={{ width: `${prediction.draw_prob * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Away Win */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-semibold">{match.away_team} gana</span>
                  <span className="text-accent font-bold">{(prediction.away_win_prob * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-primary rounded-full h-3 overflow-hidden">
                  <div 
                    className="prediction-bar bg-gradient-to-r from-blue-500 to-blue-400"
                    style={{ width: `${prediction.away_win_prob * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-primary rounded-lg p-6 border border-gray-700">
              <h5 className="text-lg font-bold text-white mb-3">Análisis</h5>
              <p className="text-gray-300 leading-relaxed">{prediction.analysis}</p>
            </div>
          </div>
        )}

        {/* Finished Match Message */}
        {match.status === 'FINISHED' && (
          <div className="bg-secondary rounded-xl p-8 border border-gray-700 text-center">
            <p className="text-gray-400 text-lg">Este partido ya ha finalizado</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/league/:leagueId" element={<LeaguePage />} />
        <Route path="/match/:matchId" element={<MatchPage />} />
      </Routes>
    </Router>
  );
}

export default App;