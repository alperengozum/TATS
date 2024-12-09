import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

export function generateRandomID() {
	const randomString = Math.random().toString(36).substr(2, 10); // Generate a random string of length 10
	const timestamp = Date.now(); // Get the current timestamp

	return `${randomString}_${timestamp}`;
}

export interface ICompressedFile {
	_id: string;
	uri: string;
	name?: string;
	type: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface CompressedState {
	compressedFiles: ICompressedFile[];
	initializeCompressedFilesFromAsyncStorage: () => Promise<void>;
	addCompressedFile: (file: ICompressedFile | ICompressedFile[]) => ICompressedFile | ICompressedFile[];
	removeCompressedFile: (file: ICompressedFile) => void;
	updateCompressedFile: (id: string, param: Partial<ICompressedFile>) => void;
	removeCompressedFiles: (fileIds: (string | number)[]) => void;
}

export const useCompressedStore = create<CompressedState>((setState, getState) => (
	{
		compressedFiles: [],
		initializeCompressedFilesFromAsyncStorage: async () => {
			const value = await AsyncStorage.getItem('compressedFiles');
			if (value !== null) {
				setState({ compressedFiles: JSON.parse(value) });
			} else {
				setState({ compressedFiles: [] });
			}
		},
		addCompressedFile: (file: ICompressedFile | ICompressedFile[]) => {
			const newFiles: ICompressedFile[] = [...getState().compressedFiles];

			if (Array.isArray(file)) {
				file.forEach((f) => {
					f._id = generateRandomID();
					f.createdAt = moment().toDate();
					f.updatedAt = moment().toDate();
				});
				newFiles.push(...file);
			} else {
				file._id = generateRandomID();
				file.createdAt = moment().toDate();
				file.updatedAt = moment().toDate();
				newFiles.push(file);
			}
			AsyncStorage.setItem("compressedFiles", JSON.stringify(newFiles));
			setState((state) => ({ compressedFiles: newFiles }));
			return file;
		},
		removeCompressedFile: (file) => {
			const newFiles = getState().compressedFiles.filter((f) => f !== file);

			AsyncStorage.setItem("compressedFiles", JSON.stringify(newFiles));
			setState((state) => ({ compressedFiles: newFiles }));
		},
		updateCompressedFile: (id: string, param: Partial<ICompressedFile>) => {
			const newFiles = getState().compressedFiles.map((f: ICompressedFile) => {
				if (f._id === id) {
					return { ...f, ...param };
				}
				return f;
			});
			AsyncStorage.setItem("compressedFiles", JSON.stringify(newFiles));
			setState((state) => ({ compressedFiles: newFiles }));
		},
		removeCompressedFiles: (fileIds: (string | number)[]) => {
			const newFiles = getState().compressedFiles.filter((f: ICompressedFile) => !fileIds.includes(f._id));
			AsyncStorage.setItem("compressedFiles", JSON.stringify(newFiles));
			setState((state) => ({ compressedFiles: newFiles }));
		}
	}
));
