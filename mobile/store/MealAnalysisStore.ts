import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import {IMealAnalysis} from "@/models/ImageUploaderModels";

export function generateRandomID() {
	const randomString = Math.random().toString(36).substr(2, 10); // Generate a random string of length 10
	const timestamp = Date.now(); // Get the current timestamp

	return `${randomString}_${timestamp}`;
}

export interface MealAnalysisState {
	mealAnalyses: IMealAnalysis[];
	initializeMealAnalysesFromAsyncStorage: () => Promise<void>;
	addMealAnalysis: (mealAnalysis: IMealAnalysis) => IMealAnalysis;
	removeMealAnalysis: (mealAnalysis: IMealAnalysis) => void;
	updateMealAnalysis: (id: string, param: Partial<IMealAnalysis>) => void;
	removeMealAnalyses: (mealAnalysisIds: (string | number)[]) => void;
}

export const useMealAnalysisStore = create<MealAnalysisState>((setState, getState) => ({
	mealAnalyses: [],
	initializeMealAnalysesFromAsyncStorage: async () => {
		const value = await AsyncStorage.getItem('mealAnalyses');
		if (value !== null) {
			setState({ mealAnalyses: JSON.parse(value) });
		} else {
			setState({ mealAnalyses: [] });
		}
	},
	addMealAnalysis: (mealAnalysis: IMealAnalysis) => {
		const newMealAnalyses: IMealAnalysis[] = [...getState().mealAnalyses];
		newMealAnalyses.push(mealAnalysis);
		AsyncStorage.setItem("mealAnalyses", JSON.stringify(newMealAnalyses));
		setState((state) => ({ mealAnalyses: newMealAnalyses }));
		return mealAnalysis;
	},
	removeMealAnalysis: (mealAnalysis) => {
		const newMealAnalyses = getState().mealAnalyses.filter((m) => m !== mealAnalysis);
		AsyncStorage.setItem("mealAnalyses", JSON.stringify(newMealAnalyses));
		setState((state) => ({ mealAnalyses: newMealAnalyses }));
	},
	updateMealAnalysis: (id: string, param: Partial<IMealAnalysis>) => {
		const newMealAnalyses = getState().mealAnalyses.map((m: IMealAnalysis) => {
			if (m.id === id) {
				return { ...m, ...param };
			}
			return m;
		});
		AsyncStorage.setItem("mealAnalyses", JSON.stringify(newMealAnalyses));
		setState((state) => ({ mealAnalyses: newMealAnalyses }));
	},
	removeMealAnalyses: (mealAnalysisIds: (string | number)[]) => {
		const newMealAnalyses = getState().mealAnalyses.filter((m: IMealAnalysis) => !mealAnalysisIds.includes(m.createdAt));
		AsyncStorage.setItem("mealAnalyses", JSON.stringify(newMealAnalyses));
		setState((state) => ({ mealAnalyses: newMealAnalyses }));
	}
}));
