import React, { useMemo, useState } from 'react';
import './EventsCarousel.css';

import image1 from '../../assets/carousel/photo1.jpg';
import image2 from '../../assets/carousel/photo2.jpg';
import image3 from '../../assets/carousel/photo3.jpg';
import image4 from '../../assets/carousel/photo4.jpg';
import image5 from '../../assets/carousel/photo5.jpg';
import image6 from '../../assets/carousel/photo6.jpg';
import image7 from '../../assets/carousel/photo7.jpg';


const eventTypes = [
    { id: 'gallery-1', image: image1 },
    { id: 'gallery-2', image: image2 },
    { id: 'gallery-3', image: image3 },
    { id: 'gallery-4', image: image4 },
    { id: 'gallery-5', image: image5 },
    { id: 'gallery-6', image: image6 },
    { id: 'gallery-7', image: image7 },
];

export default function EventsCarousel() {
    const [current, setCurrent] = useState(1);
    const [dir, setDir] = useState(null);
    const [run, setRun] = useState(false);
    const transitionMs = 650;

    const wrapIndex = (index) => (index + eventTypes.length) % eventTypes.length;

    const rightIdx = (current + eventTypes.length - 1) % eventTypes.length;
    const centerIdx = current;
    const leftIdx = (current + 1) % eventTypes.length;

    const goRight = () => {
        if (dir) return;
        setDir('right');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setRun(true));
        });
        setTimeout(() => {
            setCurrent(rightIdx);
            setDir(null);
            setRun(false);
        }, transitionMs);
    };

    const goLeft = () => {
        if (dir) return;
        setDir('left');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setRun(true));
        });
        setTimeout(() => {
            setCurrent(leftIdx);
            setDir(null);
            setRun(false);
        }, transitionMs);
    };

    const items = useMemo(() => {
        const base = [
            { key: `L-${eventTypes[leftIdx].id}`, idx: leftIdx, slot: 'left' },
            { key: `C-${eventTypes[centerIdx].id}`, idx: centerIdx, slot: 'center' },
            { key: `R-${eventTypes[rightIdx].id}`, idx: rightIdx, slot: 'right' },
        ];

        if (dir === 'left') {
            const ghostLeftIdx = wrapIndex(current + 2);
            base.push({ key: `G-R-${eventTypes[ghostLeftIdx].id}`, idx: ghostLeftIdx, slot: 'ghost-enter-left' });
        } else if (dir === 'right') {
            const ghostRightIdx = wrapIndex(current - 2);
            base.push({ key: `G-L-${eventTypes[ghostRightIdx].id}`, idx: ghostRightIdx, slot: 'ghost-enter-right' });
        }
        return base;
    }, [current, dir, leftIdx, centerIdx, rightIdx]);

    const getClass = (slot) => {
        if (!dir) return slotClass[slot].atRest;

        if (dir === 'left') {
            if (!run) return slotClassRight.start[slot];
            return slotClassRight.end[slot];
        } else { // dir === 'left'
            if (!run) return slotClassLeft.start[slot];
            return slotClassLeft.end[slot];
        }
    };

    return (
        <div className="events-carousel">
            <div className="carousel-container">
                <button className="carousel-arrow left" onClick={goLeft} disabled={!!dir}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>

                <div className="carousel-items">
                    {items.map(({ key, idx, slot }) => (
                        <div key={key} className={`carousel-item ${getClass(slot)}`}>
                            <div className="event-card">
                                {eventTypes[idx].image ? (
                                    <img src={eventTypes[idx].image} alt={`Gallery photo ${idx + 1}`} className="event-image" />
                                ) : (
                                    <h3>{eventTypes[idx].title}</h3>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="carousel-arrow right" onClick={goRight} disabled={!!dir}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
            </div>
        </div>
    );
}

const slotClass = {
    left: { atRest: 'pos-left' },
    center: { atRest: 'pos-center' },
    right: { atRest: 'pos-right' },
    'ghost-enter-left': { atRest: 'off-left' },
    'ghost-enter-right': { atRest: 'off-right' },
};

const slotClassRight = {
    start: {
        left: 'pos-left',
        center: 'pos-center',
        right: 'exit-right',
        'ghost-enter-left': 'off-left',     // ghost starts off-screen left
    },
    end: {
        left: 'to-center',
        center: 'to-right',
        right: 'to-off-right',
        'ghost-enter-left': 'to-left',
    },
};

const slotClassLeft = {
    // When clicking LEFT: everything moves to the LEFT.
    start: {
        left: 'exit-left',
        center: 'pos-center',
        right: 'pos-right',
        'ghost-enter-right': 'off-right',
    },
    end: {
        left: 'to-off-left',
        center: 'to-left',
        right: 'to-center',
        'ghost-enter-right': 'to-right',
    },
};