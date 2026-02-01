

export default function Progress ({ sections, currentIndex, setCurrentIndex }) {
    return(
        <nav className="dotnav" style={{ '--progress': `${(currentIndex+1) / (sections.length)}` }}>
            {sections.map(({ id, title }) => (
            <button
                key={id}
                onClick={() => setCurrentIndex(id)}
                className={id === currentIndex ? "active" : ""}
                aria-current={id === currentIndex ? "true" : undefined}
            >
            </button>
        ))}
      </nav>
    );
}

