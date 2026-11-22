import { useState, useEffect, useRef } from 'react';

const CHANNEL_NAME = 'spelling-bee-sync';

/**
 * Teacher window — opens a BroadcastChannel and provides a function
 * to broadcast the full game state + separate wheel-spin events.
 */
export const useTeacherSync = () => {
  const channelRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => {
      channelRef.current.close();
    };
  }, []);

  const broadcastState = (state) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'STATE_UPDATE', payload: state });
    }
  };

  const broadcastSpin = (targetIndex) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'WHEEL_SPIN', payload: { targetIndex } });
    }
  };

  return { broadcastState, broadcastSpin };
};

/**
 * Student window — listens for state updates and wheel-spin events.
 */
export const useStudentSync = (initialState) => {
  const [syncedState, setSyncedState] = useState(initialState);
  const [spinEvent, setSpinEvent] = useState(null);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (event) => {
      if (event.data.type === 'STATE_UPDATE') {
        setSyncedState(event.data.payload);
      } else if (event.data.type === 'WHEEL_SPIN') {
        setSpinEvent(event.data.payload);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  return { syncedState, spinEvent };
};
