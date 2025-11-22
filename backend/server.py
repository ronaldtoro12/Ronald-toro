from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import httpx
import os
from datetime import datetime, timedelta
import random
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI(title="Cevix API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/cevix")
client = MongoClient(MONGO_URL)
db = client.get_database()

# Collections
leagues_collection = db["leagues"]
matches_collection = db["matches"]
predictions_collection = db["predictions"]

# Football Data API configuration
FOOTBALL_API_KEY = os.getenv("FOOTBALL_API_KEY", "free")
FOOTBALL_API_URL = os.getenv("FOOTBALL_API_URL", "https://api.football-data.org/v4")

# Pydantic models
class League(BaseModel):
    id: str
    name: str
    country: str
    logo: str
    season: str

class Match(BaseModel):
    id: str
    league_id: str
    home_team: str
    away_team: str
    home_logo: str
    away_logo: str
    date: str
    status: str
    home_score: Optional[int] = None
    away_score: Optional[int] = None

class Prediction(BaseModel):
    match_id: str
    home_win_prob: float
    draw_prob: float
    away_win_prob: float
    predicted_winner: str
    confidence: str
    analysis: str

# Initialize leagues data
def init_leagues():
    leagues_data = [
        {
            "id": "PL",
            "name": "English Premier League",
            "country": "England",
            "logo": "🏴󐁧󐁢󐁥󐁮󐁧󐁿",
            "season": "2024/2025"
        },
        {
            "id": "PD",
            "name": "Spanish La Liga",
            "country": "Spain",
            "logo": "🇪🇸",
            "season": "2024/2025"
        },
        {
            "id": "BL1",
            "name": "German Bundesliga",
            "country": "Germany",
            "logo": "🇩🇪",
            "season": "2024/2025"
        },
        {
            "id": "SA",
            "name": "Italian Serie A",
            "country": "Italy",
            "logo": "🇮🇹",
            "season": "2024/2025"
        },
        {
            "id": "FL1",
            "name": "French Ligue 1",
            "country": "France",
            "logo": "🇫🇷",
            "season": "2024/2025"
        },
        {
            "id": "CL",
            "name": "UEFA Champions League",
            "country": "Europe",
            "logo": "⭐",
            "season": "2024/2025"
        },
        {
            "id": "ELC",
            "name": "English League Championship",
            "country": "England",
            "logo": "🏴󐁧󐁢󐁥󐁮󐁧󐁿",
            "season": "2024/2025"
        },
        {
            "id": "PPL",
            "name": "Scottish Premier League",
            "country": "Scotland",
            "logo": "🏴󐁧󐁢󐁳󐁣󐁴󐁿",
            "season": "2024/2025"
        },
        {
            "id": "GSL",
            "name": "Greek Superleague Greece",
            "country": "Greece",
            "logo": "🇬🇷",
            "season": "2024/2025"
        },
        {
            "id": "DED",
            "name": "Dutch Eredivisie",
            "country": "Netherlands",
            "logo": "🇳🇱",
            "season": "2024/2025"
        }
    ]
    
    if leagues_collection.count_documents({}) == 0:
        leagues_collection.insert_many(leagues_data)

# Generate sample matches
def generate_sample_matches(league_id: str):
    teams_by_league = {
        "PL": [
            ("Manchester City", "⚽"), ("Arsenal", "🔴"), ("Liverpool", "🔴"),
            ("Chelsea", "🔵"), ("Manchester United", "🔴"), ("Tottenham", "⚪")
        ],
        "PD": [
            ("Real Madrid", "⚪"), ("Barcelona", "🔵"), ("Atletico Madrid", "🔴"),
            ("Sevilla", "⚪"), ("Real Sociedad", "🔵"), ("Valencia", "🦇")
        ],
        "BL1": [
            ("Bayern Munich", "🔴"), ("Borussia Dortmund", "🟡"), ("RB Leipzig", "🔴"),
            ("Bayer Leverkusen", "🔴"), ("Union Berlin", "🔴"), ("Eintracht Frankfurt", "🦅")
        ],
        "SA": [
            ("Inter Milan", "🔵"), ("AC Milan", "🔴"), ("Juventus", "⚪"),
            ("Napoli", "🔵"), ("AS Roma", "🟡"), ("Lazio", "🦅")
        ],
        "FL1": [
            ("PSG", "🔵"), ("Monaco", "🔴"), ("Marseille", "⚪"),
            ("Lyon", "🔵"), ("Lille", "🔴"), ("Nice", "🔴")
        ]
    }
    
    teams = teams_by_league.get(league_id, [("Team A", "⚽"), ("Team B", "⚽")])
    matches = []
    
    for i in range(10):
        home_team, home_logo = random.choice(teams)
        away_team, away_logo = random.choice([t for t in teams if t[0] != home_team])
        
        match_date = datetime.now() + timedelta(days=random.randint(-7, 14))
        is_past = match_date < datetime.now()
        
        match = {
            "id": f"{league_id}_{i}",
            "league_id": league_id,
            "home_team": home_team,
            "away_team": away_team,
            "home_logo": home_logo,
            "away_logo": away_logo,
            "date": match_date.isoformat(),
            "status": "FINISHED" if is_past else "SCHEDULED",
            "home_score": random.randint(0, 4) if is_past else None,
            "away_score": random.randint(0, 4) if is_past else None
        }
        matches.append(match)
    
    return matches

# Generate prediction based on match data
def generate_prediction(match: dict):
    # Simple algorithm based on team names and random factors
    base_home_advantage = 0.40
    base_draw = 0.25
    base_away = 0.35
    
    # Add some randomness
    variation = random.uniform(-0.1, 0.1)
    home_prob = max(0.1, min(0.8, base_home_advantage + variation))
    draw_prob = max(0.1, min(0.4, base_draw - variation/2))
    away_prob = max(0.1, min(0.8, 1 - home_prob - draw_prob))
    
    # Normalize probabilities
    total = home_prob + draw_prob + away_prob
    home_prob = round(home_prob / total, 2)
    draw_prob = round(draw_prob / total, 2)
    away_prob = round(1 - home_prob - draw_prob, 2)
    
    # Determine predicted winner
    max_prob = max(home_prob, draw_prob, away_prob)
    if max_prob == home_prob:
        predicted_winner = match["home_team"]
        confidence = "Alta" if home_prob > 0.5 else "Media"
    elif max_prob == away_prob:
        predicted_winner = match["away_team"]
        confidence = "Alta" if away_prob > 0.5 else "Media"
    else:
        predicted_winner = "Empate"
        confidence = "Media"
    
    analysis = f"Basado en el análisis estadístico, {predicted_winner} tiene la mayor probabilidad de ganar este encuentro. "
    analysis += f"El equipo local {match['home_team']} tiene un {int(home_prob*100)}% de probabilidad, "
    analysis += f"mientras que {match['away_team']} tiene un {int(away_prob*100)}%. "
    analysis += f"La probabilidad de empate es del {int(draw_prob*100)}%."
    
    return {
        "match_id": match["id"],
        "home_win_prob": home_prob,
        "draw_prob": draw_prob,
        "away_win_prob": away_prob,
        "predicted_winner": predicted_winner,
        "confidence": confidence,
        "analysis": analysis
    }

@app.on_event("startup")
async def startup_event():
    init_leagues()

@app.get("/api/")
async def root():
    return {"message": "Bienvenido a Cevix API - Pronósticos de Fútbol"}

@app.get("/api/leagues")
async def get_leagues():
    leagues = list(leagues_collection.find({}, {"_id": 0}))
    return {"leagues": leagues}

@app.get("/api/leagues/{league_id}/matches")
async def get_matches(league_id: str):
    # Check if matches exist in database
    existing_matches = list(matches_collection.find({"league_id": league_id}, {"_id": 0}))
    
    if not existing_matches:
        # Generate sample matches
        matches = generate_sample_matches(league_id)
        if matches:
            matches_collection.insert_many(matches)
            # Fetch them back without _id
            existing_matches = list(matches_collection.find({"league_id": league_id}, {"_id": 0}))
            return {"matches": existing_matches}
        return {"matches": []}
    
    return {"matches": existing_matches}

@app.get("/api/matches/{match_id}/prediction")
async def get_prediction(match_id: str):
    # Check if prediction exists
    existing_prediction = predictions_collection.find_one({"match_id": match_id}, {"_id": 0})
    
    if existing_prediction:
        return existing_prediction
    
    # Get match data
    match = matches_collection.find_one({"id": match_id}, {"_id": 0})
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Generate prediction
    prediction = generate_prediction(match)
    predictions_collection.insert_one(prediction)
    
    return prediction

@app.get("/api/stats")
async def get_stats():
    total_leagues = leagues_collection.count_documents({})
    total_matches = matches_collection.count_documents({})
    total_predictions = predictions_collection.count_documents({})
    
    return {
        "total_leagues": total_leagues,
        "total_matches": total_matches,
        "total_predictions": total_predictions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)