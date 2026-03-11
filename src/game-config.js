export const GAME_CONFIG = {
    "Genshin Impact": {
        current_version: 6.4,
        version_start: "2026-02-25",
        version_duration: 42, // Days
        maintenance_start: 22, // Hour
        maintenance_estimation: 5, // Hours
        process: "GenshinImpact.exe",
    },
    "Honkai: Star Rail": {
        current_version: 4.0,
        version_start: "2026-02-13",
        version_duration: 40,
        maintenance_start: 22,
        maintenance_estimation: 5,
        weekly_anchors: {
            "Currency Wars": "2026-02-16T00:00:00Z",
            "Divergent Universe": "2026-02-09T00:00:00Z"
        },
        endgame_anchors: {
            "Memory of Chaos": "2026-01-19T00:00:00Z",
            "Pure Fiction": "2026-02-16T00:00:00Z",
            "Apocalyptic Shadow": "2026-02-02T00:00:00Z"
        },
        process: "StarRail.exe"
    },
    "Zenless Zone Zero": {
        current_version: 2.6,
        version_start: "2026-02-06",
        version_duration: 42,
        maintenance_start: 22,
        maintenance_estimation: 5,
        endgame_anchors: {
            "Shiyu Defense": "2026-02-20T00:00:00Z",
            "Deadly Assault": "2026-02-13T00:00:00Z",
            "Battle Trial": "2025-07-16T00:00:00Z",
            "Threshold Simulation": "2026-02-06T00:00:00Z"
        },
        process: "ZenlessZoneZero.exe"
    }
}