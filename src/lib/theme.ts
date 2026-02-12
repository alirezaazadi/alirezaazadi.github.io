/**
 * Simplified SunCalc — calculates sunrise/sunset for auto dark/light mode.
 * Uses an approximation of the solar position algorithm.
 */

const ZENITH = 90.833; // degrees

function toRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
    return (rad * 180) / Math.PI;
}

export function getSunTimes(
    lat: number,
    lng: number,
    date: Date = new Date()
): { sunrise: Date; sunset: Date } {
    const dayOfYear = getDayOfYear(date);

    // Sunrise equation approximation
    const D2R = Math.PI / 180;
    const lngHour = lng / 15;

    // Sunrise
    const tRise = dayOfYear + (6 - lngHour) / 24;
    const MRise = 0.9856 * tRise - 3.289;
    let LRise =
        MRise +
        1.916 * Math.sin(MRise * D2R) +
        0.02 * Math.sin(2 * MRise * D2R) +
        282.634;
    LRise = ((LRise % 360) + 360) % 360;

    let RARise = toDeg(Math.atan(0.91764 * Math.tan(toRad(LRise))));
    RARise = ((RARise % 360) + 360) % 360;

    const LquadRise = Math.floor(LRise / 90) * 90;
    const RAquadRise = Math.floor(RARise / 90) * 90;
    RARise = (RARise + (LquadRise - RAquadRise)) / 15;

    const sinDecRise = 0.39782 * Math.sin(toRad(LRise));
    const cosDecRise = Math.cos(Math.asin(sinDecRise));

    const cosHRise =
        (Math.cos(toRad(ZENITH)) - sinDecRise * Math.sin(toRad(lat))) /
        (cosDecRise * Math.cos(toRad(lat)));

    const HRise = (360 - toDeg(Math.acos(Math.max(-1, Math.min(1, cosHRise))))) / 15;
    const TRise = HRise + RARise - 0.06571 * tRise - 6.622;
    let UTRise = ((TRise - lngHour) % 24 + 24) % 24;

    // Sunset
    const tSet = dayOfYear + (18 - lngHour) / 24;
    const MSet = 0.9856 * tSet - 3.289;
    let LSet =
        MSet +
        1.916 * Math.sin(MSet * D2R) +
        0.02 * Math.sin(2 * MSet * D2R) +
        282.634;
    LSet = ((LSet % 360) + 360) % 360;

    let RASet = toDeg(Math.atan(0.91764 * Math.tan(toRad(LSet))));
    RASet = ((RASet % 360) + 360) % 360;

    const LquadSet = Math.floor(LSet / 90) * 90;
    const RAquadSet = Math.floor(RASet / 90) * 90;
    RASet = (RASet + (LquadSet - RAquadSet)) / 15;

    const sinDecSet = 0.39782 * Math.sin(toRad(LSet));
    const cosDecSet = Math.cos(Math.asin(sinDecSet));

    const cosHSet =
        (Math.cos(toRad(ZENITH)) - sinDecSet * Math.sin(toRad(lat))) /
        (cosDecSet * Math.cos(toRad(lat)));

    const HSet = toDeg(Math.acos(Math.max(-1, Math.min(1, cosHSet)))) / 15;
    const TSet = HSet + RASet - 0.06571 * tSet - 6.622;
    let UTSet = ((TSet - lngHour) % 24 + 24) % 24;

    const sunrise = new Date(date);
    sunrise.setUTCHours(Math.floor(UTRise), Math.round((UTRise % 1) * 60), 0, 0);

    const sunset = new Date(date);
    sunset.setUTCHours(Math.floor(UTSet), Math.round((UTSet % 1) * 60), 0, 0);

    return { sunrise, sunset };
}

function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Returns whether it's currently daytime at the given coordinates
 */
export function isDaytime(lat: number, lng: number): boolean {
    const { sunrise, sunset } = getSunTimes(lat, lng);
    const now = new Date();
    return now >= sunrise && now <= sunset;
}
