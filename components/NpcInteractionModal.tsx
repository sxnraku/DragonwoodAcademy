import React, { useState, useRef, useEffect } from 'react';
import { NPC, Player, ChatMessage, Interaction } from '../types';
import { Send, Bot, User, Swords } from 'lucide-react';
import { getDynamicNpcResponse, getPostDuelResponse } from '../services/aiService';
import { useLocalization } from '../i18n';

interface NpcInteractionModalProps {
  npc: NPC;
  player: Player;
  onClose: () => void;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  onAddHistoryEntry: (interaction: Interaction) => void;
  onStartDuel?: (npc: NPC) => void;
  /** Definido quando a conversa reabre logo a seguir a um duelo despoletado por provocacao. */
  postDuelResult?: 'win' | 'loss';
}

export const NpcInteractionModal: React.FC<NpcInteractionModalProps> = ({ npc, player, onClose, setPlayer, onAddHistoryEntry, onStartDuel, postDuelResult }) => {
    const { t, language } = useLocalization();
    const [conversation, setConversation] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [playerInput, setPlayerInput] = useState('');
    const [hasTriggeredDuel, setHasTriggeredDuel] = useState(false);
    const conversationEndRef = useRef<null | HTMLDivElement>(null);
    const postDuelRequested = useRef(false);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation]);

    // Abertura pos-duelo: o NPC fala primeiro, a reagir ao resultado do combate.
    useEffect(() => {
        if (!postDuelResult || postDuelRequested.current) return;
        postDuelRequested.current = true;

        const playerWon = postDuelResult === 'win';

        (async () => {
            setIsLoading(true);
            try {
                const currentAffinity = player.relationships[npc.id] || 0;
                const reaction = await getPostDuelResponse(
                    npc.id, t(npc.nameKey), t(npc.descriptionKey),
                    player.name, playerWon, currentAffinity, language
                );

                setConversation(prev => [...prev, { sender: 'npc', text: reaction.responseText, npcName: t(npc.nameKey) }]);
                setPlayer(p => {
                    if (!p) return null;
                    const newRelationships = { ...p.relationships, [npc.id]: (p.relationships[npc.id] || 0) + reaction.affinityChange };
                    return { ...p, relationships: newRelationships };
                });
                onAddHistoryEntry({
                    eventTitle: t('log_convo_title', { npcName: t(npc.nameKey) }),
                    choiceText: playerWon ? 'Venceu o duelo' : 'Perdeu o duelo',
                    outcome: { description: reaction.responseText, affinityChange: reaction.affinityChange },
                    npcId: npc.id,
                });
            } finally {
                setIsLoading(false);
            }
        })();

        // Sem flag de cancelamento por invocacao: em <StrictMode> o React corre o efeito,
        // limpa e volta a correr. Um "cancelled" definido na limpeza da 1a passagem
        // descartaria a resposta que chega depois, deixando o loading preso para sempre.
        // O postDuelRequested garante uma unica chamada; escrever estado apos desmontar
        // e inofensivo no React 18+.
        // Depende so do resultado do duelo: t/setPlayer/onAddHistoryEntry mudam de
        // identidade a cada render do GameView e fariam o efeito recorrer.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postDuelResult]);

    const handleSend = async () => {
        if (!playerInput.trim() || isLoading) return;

        const messageToSend = playerInput;
        const newPlayerMessage: ChatMessage = { sender: 'player', text: messageToSend };
        const historyForAPI = conversation;

        setPlayerInput('');
        setConversation(prev => [...prev, newPlayerMessage]);
        setIsLoading(true);

        try {
            const currentAffinity = player.relationships[npc.id] || 0;
            const response = await getDynamicNpcResponse(npc, player.name, historyForAPI, messageToSend, currentAffinity, language);

            if (response) {
                const newNpcMessage: ChatMessage = { sender: 'npc', text: response.responseText, npcName: t(npc.nameKey) };
                setConversation(prev => [...prev, newNpcMessage]);
                setPlayer(p => {
                    if (!p) return null;
                    const newRelationships = { ...p.relationships, [npc.id]: (p.relationships[npc.id] || 0) + response.affinityChange };
                    return { ...p, relationships: newRelationships };
                });
                onAddHistoryEntry({
                    eventTitle: t('log_convo_title', { npcName: t(npc.nameKey) }),
                    choiceText: messageToSend,
                    outcome: { description: response.responseText, affinityChange: response.affinityChange },
                    npcId: npc.id,
                });

                if (response.triggerDuel) {
                    setHasTriggeredDuel(true);
                }

            } else { throw new Error("No response from service"); }
        } catch (e) {
            const errorMessage: ChatMessage = { sender: 'npc', text: t('error_generic_api'), npcName: t('system_name') };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-slate-800 border-2 border-yellow-400 rounded-2xl shadow-2xl p-6 w-full max-w-2xl text-white flex flex-col h-[80vh]">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-3xl font-medieval text-yellow-300">{t('modal_talking_to', { npcName: t(npc.nameKey) })}</h2>
                    <button onClick={onClose} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                       {t('button_end_conversation')}
                    </button>
                </div>
                {postDuelResult && (
                    <div className={`mb-4 px-4 py-2 rounded-xl border-2 flex items-center justify-center gap-2 flex-shrink-0 ${
                        postDuelResult === 'win'
                            ? 'bg-amber-900/40 border-amber-400 text-amber-200'
                            : 'bg-slate-900/60 border-slate-500 text-slate-300'
                    }`}>
                        <Swords className="w-5 h-5" />
                        <span className="font-medieval text-lg">
                            {postDuelResult === 'win'
                                ? `Venceste o duelo contra ${t(npc.nameKey)}`
                                : `Perdeste o duelo contra ${t(npc.nameKey)}`}
                        </span>
                    </div>
                )}
                <div className="flex-grow bg-slate-900 rounded-lg p-4 mb-4 overflow-y-auto space-y-4">
                    {conversation.map((chat, index) => (
                        <div key={index} className={`flex items-start gap-3 ${chat.sender === 'player' ? 'justify-end' : ''}`}>
                            {chat.sender === 'npc' && <div className="bg-yellow-600 rounded-full p-2 flex-shrink-0"><Bot className="w-6 h-6 text-slate-900"/></div>}
                            <div className={`max-w-[80%] rounded-xl p-3 ${chat.sender === 'player' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                {chat.sender === 'npc' && <p className="font-bold text-yellow-200 text-sm mb-1">{chat.npcName}</p>}
                                <p className="whitespace-pre-wrap">{chat.text}</p>
                            </div>
                             {chat.sender === 'player' && <div className="bg-slate-600 rounded-full p-2 flex-shrink-0"><User className="w-6 h-6 text-white"/></div>}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                             <div className="bg-yellow-600 rounded-full p-2 flex-shrink-0"><Bot className="w-6 h-6 text-slate-900"/></div>
                             <div className="max-w-[80%] rounded-xl p-3 bg-slate-700 text-slate-200">
                                 <p className="font-bold text-yellow-200 text-sm mb-1">{t(npc.nameKey)}</p>
                                 <div className="flex items-center space-x-1">
                                     <span className="h-2 w-2 bg-yellow-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                     <span className="h-2 w-2 bg-yellow-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                     <span className="h-2 w-2 bg-yellow-300 rounded-full animate-bounce"></span>
                                 </div>
                             </div>
                         </div>
                    )}
                    <div ref={conversationEndRef} />
                </div>

                {hasTriggeredDuel && (
                    <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-red-900/90 to-amber-900/90 border-2 border-amber-400 text-center animate-pulse flex flex-col items-center gap-2">
                        <p className="font-medieval text-yellow-200 text-lg flex items-center gap-2">
                            <Swords className="w-6 h-6 text-amber-400" />
                            {t(npc.nameKey)} aceitou a tua provocação e desafiou-te para um duelo!
                        </p>
                        <button
                            onClick={() => {
                                onClose();
                                if (onStartDuel) onStartDuel(npc);
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg text-md flex items-center gap-2 transition-transform hover:scale-105"
                        >
                            <Swords className="w-5 h-5" /> Aceitar Desafio e Entrar em Combate!
                        </button>
                    </div>
                )}

                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-4 flex-shrink-0"
                >
                    <input
                        type="text" value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                        placeholder={t('chat_placeholder', { npcName: t(npc.nameKey) })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" disabled={isLoading || !playerInput.trim()}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold p-3 rounded-lg transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};