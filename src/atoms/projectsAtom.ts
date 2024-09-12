import { atom } from 'jotai';
import { Getter, Setter } from 'jotai/experimental';
import { atomWithStorage, useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import Project from '../models/Project';
import { readJSONFile, writeJSONFile } from '../utils/file';
import { storagePathAtom } from './preferenceAtom';

/**
 * プロジェクトリストAtom
 */
const projectsMemoAtom = atom<Project[]>([]);

/**
 * 並び優先度順のプロジェクトIDリスト
 */
const projectsSortOrderIdsAtom = atomWithStorage<string[]>('projectSortOrderIds', []);

/**
 * プロジェクトリスト
 * 取得時に並べ替えを反映する
 * メモリ上の値のみ更新し、ファイルの読み書きはコールバックに委任する
 */
export const projectsAtom = atom(
  (get): Project[] => {
    const projects = get(projectsMemoAtom);
    const sortOrderIds = get(projectsSortOrderIdsAtom);

    const sorded: (Project | undefined)[] = [];
    const other: Project[] = [];
    projects.forEach((project) => {
      const index = sortOrderIds.indexOf(project.id);
      if (index < 0) {
        other.push(project);
        return;
      }
      sorded[index] = project;
    });

    const sortedSet = new Set(sorded);
    sortedSet.delete(undefined);
    return [...sortedSet, ...other] as Project[];
  },
  (_, set, projects: Project[]) => {
    set(projectsMemoAtom, projects);
  }
);

/**
 * プロジェクトリストをファイルから読み込み
 * @returns コールバック
 */
export const useReadProjectsFile = () =>
  useAtomCallback(
    useCallback(async (get: Getter, set: Setter) => {
      const storagePath = get(storagePathAtom);
      const data = await readJSONFile(`${storagePath}/projects.json`);
      const newProjects = data instanceof Array ? data.map((datum) => new Project(datum)) : [];
      set(projectsMemoAtom, newProjects);
    }, [])
  );

/**
 * プロジェクトリストをファイルに書き込みコールバックを用意
 * @returns コールバック
 */
export const useWriteProjectsFile = () =>
  useAtomCallback(
    useCallback(async (get: Getter) => {
      const projects = get(projectsMemoAtom);
      const storagePath = get(storagePathAtom);
      writeJSONFile(
        `${storagePath}/projects.json`,
        projects.map((project) => project.toObject())
      );
    }, [])
  );

/**
 * プロジェクトリストをファイルから読み込み
 * @returns コールバック
 */
export const useSortProjects = () =>
  useAtomCallback(
    useCallback(async (get: Getter, set: Setter, projectId: string) => {
      const projectIds = get(projectsSortOrderIdsAtom);
      const projectIdSet = new Set([projectId, ...projectIds]);
      set(projectsSortOrderIdsAtom, [...projectIdSet]);
    }, [])
  );
