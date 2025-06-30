import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Clock, Save, History, X } from 'lucide-react';

export default function StopwatchApp() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [savedSessions, setSavedSessions] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [nameError, setNameError] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (isRunning) {
      const lapTime = time;
      const lapNumber = laps.length + 1;
      setLaps(prev => [...prev, { number: lapNumber, time: lapTime }]);
    }
  };

  const handleSave = () => {
    if (time > 0 && !isRunning) {
      setShowSaveDialog(true);
    }
  };

  const checkNameExists = (name) => {
    return savedSessions.some(session => 
      session.name.toLowerCase() === name.toLowerCase()
    );
  };

  const confirmSave = () => {
    const trimmedName = sessionName.trim();
    
    if (!trimmedName) {
      setNameError('Please enter a session name');
      return;
    }
    
    if (checkNameExists(trimmedName)) {
      setNameError('A session with this name already exists');
      return;
    }
    
    const session = {
      id: Date.now(),
      name: trimmedName,
      totalTime: time,
      laps: [...laps],
      date: new Date().toLocaleString(),
      lapCount: laps.length
    };
    
    setSavedSessions(prev => [session, ...prev]);
    setSessionName('');
    setNameError('');
    setShowSaveDialog(false);
  };

  const cancelSave = () => {
    setSessionName('');
    setNameError('');
    setShowSaveDialog(false);
  };

  const deleteSession = (sessionId) => {
    setSavedSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const getBestAndWorstLap = () => {
    if (laps.length < 2) return { best: null, worst: null };
    
    const lapTimes = laps.map((lap, index) => ({
      ...lap,
      interval: index === 0 ? lap.time : lap.time - laps[index - 1].time
    }));
    
    const sortedByInterval = [...lapTimes].sort((a, b) => a.interval - b.interval);
    return {
      best: sortedByInterval[0],
      worst: sortedByInterval[sortedByInterval.length - 1]
    };
  };

  const { best, worst } = getBestAndWorstLap();

  return (
    <div className="flex items-center justify-center min-h-screen p-2 bg-gradient-to-br from-indigo-900 via-blue-900 to-cyan-900 sm:p-4">
      <div className="w-full max-w-xs mx-auto sm:max-w-md lg:max-w-2xl">
        {/* Main Stopwatch Display */}
        <div className="p-4 mb-4 border shadow-2xl bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl sm:p-8 lg:p-12 border-white/20 sm:mb-6">
          <div className="mb-6 text-center sm:mb-8 lg:mb-10">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Clock className="w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-cyan-400 sm:mr-3" />
              <h1 className="text-xl font-bold text-transparent sm:text-2xl lg:text-5xl bg-gradient-to-r from-sky-600 to-pink-500 bg-clip-text">StopWatch</h1>
            </div>
            
            {/* Time Display */}
            <div className="mb-6 font-mono text-4xl font-bold tracking-wider text-white sm:text-6xl lg:text-8xl sm:mb-8 lg:mb-10">
              {formatTime(time)}
            </div>
            
            {/* Control Buttons */}
            <div className="flex justify-center mb-4 space-x-3 sm:space-x-4 lg:space-x-6 sm:mb-6 lg:mb-8">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="p-3 text-white transition-all duration-200 transform bg-green-500 rounded-full shadow-lg hover:bg-green-600 sm:p-4 lg:p-6 hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="p-3 text-white transition-all duration-200 transform bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 sm:p-4 lg:p-6 hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </button>
              )}
              
              {/* Toggle between Lap and Reset */}
              {isRunning ? (
                <button
                  onClick={handleLap}
                  className="p-3 text-white transition-all duration-200 transform bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 sm:p-4 lg:p-6 hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <Square className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="p-3 text-white transition-all duration-200 transform bg-red-500 rounded-full shadow-lg hover:bg-red-600 sm:p-4 lg:p-6 hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </button>
              )}
              
              <button
                onClick={handleSave}
                disabled={time === 0 || isRunning}
                className={`${
                  time > 0 && !isRunning
                    ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                } p-3 sm:p-4 lg:p-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none disabled:shadow-lg`}
              >
                <Save className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              </button>
            </div>
            
            {/* Button Labels */}
            <div className="flex justify-center mb-4 space-x-3 text-xs text-gray-300 sm:space-x-4 lg:space-x-6 sm:text-sm lg:text-lg sm:mb-6">
              <span className="w-12 text-center sm:w-16 lg:w-20">
                {!isRunning ? 'Start' : 'Pause'}
              </span>
              <span className="w-12 text-center sm:w-16 lg:w-20">
                {isRunning ? 'Lap' : 'Reset'}
              </span>
              <span className="w-12 text-center sm:w-16 lg:w-20">Save</span>
            </div>
            
            {/* History Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowHistory(true)}
                disabled={savedSessions.length === 0}
                className={`${
                  savedSessions.length > 0 
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white' 
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                } px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none disabled:shadow-lg flex items-center space-x-2 text-sm sm:text-base lg:text-lg`}
              >
                <History className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">View History ({savedSessions.length})</span>
                <span className="sm:hidden">History ({savedSessions.length})</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Lap Times */}
        {laps.length > 0 && (
          <div className="p-4 border shadow-2xl bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl sm:p-6 lg:p-8 border-white/20">
            <h2 className="mb-4 text-lg font-bold text-center text-white sm:text-xl lg:text-2xl sm:mb-6">Lap Times</h2>
            <div className="overflow-y-auto max-h-60 sm:max-h-72 lg:max-h-80">
              <div className="space-y-2 sm:space-y-3">
                {laps.map((lap, index) => {
                  const intervalTime = index === 0 ? lap.time : lap.time - laps[index - 1].time;
                  const isBest = best && lap.number === best.number && laps.length > 1;
                  const isWorst = worst && lap.number === worst.number && laps.length > 1;
                  
                  return (
                    <div
                      key={lap.number}
                      className={`flex justify-between items-center p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-200 ${
                        isBest 
                          ? 'bg-green-500/20 border border-green-400/30' 
                          : isWorst 
                          ? 'bg-red-500/20 border border-red-400/30'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center flex-1 space-x-2 sm:space-x-3 lg:space-x-4">
                        <span className="w-6 font-mono text-sm text-gray-300 sm:text-base lg:text-lg sm:w-8 lg:w-10">
                          #{lap.number}
                        </span>
                        <span className="font-mono text-base font-bold text-white sm:text-lg lg:text-xl">
                          {formatTime(intervalTime)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-gray-400 sm:text-base lg:text-lg">
                          {formatTime(lap.time)}
                        </span>
                        {isBest && (
                          <span className="text-xs font-bold text-green-400 sm:text-sm">BEST</span>
                        )}
                        {isWorst && (
                          <span className="text-xs font-bold text-red-400 sm:text-sm">WORST</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-sm p-6 border shadow-2xl bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl sm:p-8 border-white/20 sm:max-w-md">
              <h3 className="mb-4 text-xl font-bold text-center text-white sm:text-2xl sm:mb-6">Save Session</h3>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => {
                  setSessionName(e.target.value);
                  setNameError('');
                }}
                placeholder="Enter session name..."
                className="w-full px-3 py-2 mb-2 text-sm text-white placeholder-gray-400 border rounded-lg sm:px-4 sm:py-3 sm:rounded-xl bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 sm:text-base"
                onKeyPress={(e) => e.key === 'Enter' && confirmSave()}
                autoFocus
              />
              {nameError && (
                <p className="mb-4 text-sm text-red-400">{nameError}</p>
              )}
              <div className="flex mt-4 space-x-3">
                <button
                  onClick={cancelSave}
                  className="flex-1 px-3 py-2 text-sm text-white transition-all duration-200 bg-gray-500 rounded-lg sm:px-4 sm:py-3 hover:bg-gray-600 sm:rounded-xl sm:text-base lg:text-lg active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSave}
                  disabled={!sessionName.trim()}
                  className="flex-1 px-3 py-2 text-sm text-white transition-all duration-200 bg-purple-500 rounded-lg sm:px-4 sm:py-3 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed sm:rounded-xl sm:text-base lg:text-lg active:scale-95"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 sm:p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20 w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">Session History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <X className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[70vh] sm:max-h-[60vh] space-y-3 sm:space-y-4">
                {savedSessions.map((session) => {
                  const lapIntervals = session.laps.map((lap, index) => 
                    index === 0 ? lap.time : lap.time - session.laps[index - 1].time
                  );
                  
                  const sessionBest = session.laps.length > 1 ? Math.min(...lapIntervals) : null;
                  const sessionWorst = session.laps.length > 1 ? Math.max(...lapIntervals) : null;
                  
                  return (
                    <div key={session.id} className="p-4 border rounded-lg bg-white/5 sm:rounded-xl sm:p-5 lg:p-6 border-white/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-2">
                          <h4 className="text-base font-bold text-white break-words sm:text-lg lg:text-xl">{session.name}</h4>
                          <p className="text-xs text-gray-400 sm:text-sm lg:text-base">{session.date}</p>
                        </div>
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="flex-shrink-0 text-red-400 transition-colors hover:text-red-300"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4 lg:gap-6 sm:text-base">
                        <div>
                          <span className="text-gray-400">Total Time:</span>
                          <p className="font-mono text-base font-bold text-white sm:text-lg">{formatTime(session.totalTime)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Laps:</span>
                          <p className="text-base font-bold text-white sm:text-lg">{session.lapCount}</p>
                        </div>
                        {sessionBest && (
                          <>
                            <div>
                              <span className="text-gray-400">Best Lap:</span>
                              <p className="font-mono text-base font-bold text-green-400 sm:text-lg">{formatTime(sessionBest)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Worst Lap:</span>
                              <p className="font-mono text-base font-bold text-red-400 sm:text-lg">{formatTime(sessionWorst)}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {savedSessions.length === 0 && (
                <div className="py-8 text-base text-center text-gray-400 sm:py-12 sm:text-lg">
                  No saved sessions yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}