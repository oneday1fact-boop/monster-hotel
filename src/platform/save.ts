import {readCloudTasks,type CloudTaskId} from '../domain/cloudTasks';
import {readVisitorEvent,type VisitorEvent} from '../domain/visitorEvent';
import {readCommissions,type Commissions} from '../domain/commissions';
import {readTeaCase,type TeaCase} from '../domain/teaCase';
import {isExpansion,type ExpansionId} from '../domain/hotelEstate';
import { validPhoto, photoSolved, type PhotoState } from '../domain/guestPuzzles';
import { isEpisode, type EpisodeId } from '../domain/episodes';
import { isAmbience, type Ambience } from '../domain/ambience';
import { isDecoration, type DecorationId } from '../domain/decorations';
import { isUnlocked, levels } from '../domain/levels';
export interface Save {
    version: 1;
    completed: number[];
    coins: number;
    hotelRooms?: ExpansionId[];
    teaCase?: TeaCase;
    visitorEvent?: VisitorEvent;
    commissions?: Commissions;
    cloudTasks?: Partial<Record<CloudTaskId,Commissions>>;
    photos?: {
        party?: PhotoState;
    };
    episodes?: EpisodeId[];
    ambience?: Ambience;
    scenes?: Ambience[];
    decorations?: DecorationId[];
    equipped?: DecorationId[];
    storyNight?: {
        outcome: 'play' | 'together';
    };
    stories?: Partial<Record<2 | 3 | 4 | 5 | 6, {
        outcome: 'play' | 'together';
    }>>;
}
const key = 'midnight-check-in.save.v1';
export function readSave(): Save {
    try {
        const value = JSON.parse(localStorage.getItem(key) ?? 'null');
        if (value?.version === 1 && Array.isArray(value.completed) && value.completed.every((n: unknown) => Number.isInteger(n) && Number(n) > 0) && Number.isSafeInteger(value.coins) && value.coins >= 0) {
            const save: Save = { version: 1, completed: [...new Set<number>(value.completed.filter((id: number) => levels.some(l => l.id === id)))], coins: value.coins };
            if (validPhoto(value.photos?.party) && photoSolved(value.photos.party))
                save.photos = { party: { order: [...value.photos.party.order], poses: { ...value.photos.party.poses } } };
            if(value.cloudTasks)save.cloudTasks=readCloudTasks(value.cloudTasks);
            const jobs=readCommissions(value.commissions);if(jobs)save.commissions=jobs;
            const visitor=readVisitorEvent(value.visitorEvent);if(visitor)save.visitorEvent=visitor;
            const tea=readTeaCase(value.teaCase);if(tea)save.teaCase=tea;
            if (Array.isArray(value.hotelRooms)) save.hotelRooms=[...new Set<ExpansionId>(value.hotelRooms.filter(isExpansion))];
            if (Array.isArray(value.episodes))
                save.episodes = [...new Set<EpisodeId>(value.episodes.filter(isEpisode))];
            if (Array.isArray(value.decorations)) {
                save.decorations = [...new Set<DecorationId>(value.decorations.filter(isDecoration))];
                save.equipped = Array.isArray(value.equipped) ? [...new Set<DecorationId>(value.equipped.filter((id: unknown) => isDecoration(id) && save.decorations!.includes(id)))] : [];
            }
            if (value.storyNight?.outcome === 'play' || value.storyNight?.outcome === 'together')
                save.storyNight = { outcome: value.storyNight.outcome };
            for (const id of [2, 3, 4, 5, 6] as const) {
                const outcome = value.stories?.[id]?.outcome;
                if ((outcome === 'play' || outcome === 'together') && save.storyNight && (id === 2 || save.stories?.[(id - 1) as 2 | 3 | 4 | 5]))
                    save.stories = { ...save.stories, [id]: { outcome } };
            }
            if (Array.isArray(value.scenes))
                save.scenes = [...new Set<Ambience>(['morning', ...value.scenes.filter(isAmbience)])];
            if (isAmbience(value.ambience) && (!save.scenes || save.scenes.includes(value.ambience)))
                save.ambience = value.ambience;
            return save;
        }
    }
    catch { /* Storage unavailable or corrupt: continue offline in memory. */ }
    return { version: 1, completed: [], coins: 0 };
}
export function complete(save: Save, level: number): Save {
    if (save.completed.includes(level) || !isUnlocked(level, save.completed))
        return save;
    const next: Save = { ...save, completed: [...save.completed, level], coins: save.coins + 50 };
    writeSave(next);
    return next;
}
export function writeSave(save: Save): boolean {
    try {
        localStorage.setItem(key, JSON.stringify(save));
        return true;
    }
    catch {
        return false;
    }
}
