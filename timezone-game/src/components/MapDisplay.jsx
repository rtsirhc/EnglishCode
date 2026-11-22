import timezoneMap from '../assets/timezone-map.png'

/**
 * MapDisplay — Fixed background world map.
 * Sits behind the question card with subtle opacity.
 * Must NOT shift layout when questions change.
 */
export default function MapDisplay() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <img
                src={timezoneMap}
                alt="World Time Zone Map"
                className="w-full h-full object-contain opacity-25"
                draggable={false}
            />
        </div>
    )
}
