

export default function Timestamp ({ sections, currentIndex }) {
    const currentEra = sections[currentIndex]?.era;
    return(
        <div>
            <h1>
                <div className="timestamp">
                    <span>{currentEra}</span>
                </div>
            </h1>
        </div>
    );
}
