import { useState, useEffect, useRef } from 'react';

const CHANNEL_NAME = 'englishcode:spelling-bee:display:v1';

/**
 * Teacher window — opens a BroadcastChannel and provides a function
 * to broadcast the full game state + separate wheel-spin events.
 */
export const useTeacherSync = (displayId) => {
  const channelRef = useRef(null);
  const latestRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME + ':' + displayId);
    channelRef.current.onmessage = event => {
      if (event.data?.type === 'REQUEST_STATE' && latestRef.current) channelRef.current?.postMessage({ type: 'STATE_UPDATE', payload: latestRef.current });
    };
    return () => {
      channelRef.current.close();
    };
  }, [displayId]);

  const broadcastState = (state) => {
    latestRef.current = state;
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
export const useStudentSync = (initialState, displayId) => {
  const [syncedState, setSyncedState] = useState(initialState);
  const [spinEvent, setSpinEvent] = useState(null);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME + ':' + displayId);

    channel.onmessage = (event) => {
      if (event.data.type === 'STATE_UPDATE') {
        setSyncedState(event.data.payload);
      } else if (event.data.type === 'WHEEL_SPIN') {
        setSpinEvent(event.data.payload);
      }
    };

    channel.postMessage({ type: 'REQUEST_STATE' });
    return () => {
      channel.close();
    };
  }, [displayId]);

  return { syncedState, spinEvent };
};
