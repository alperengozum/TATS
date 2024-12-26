// Request
export interface IMealRequest {
	image: string;
	takenAt: number;
	createdAt: number;
}

// Response
export interface IMealAnalysis {
	id: string;
	image: string;
	createdAt: string;
	takenAt: string;
	meals: IMeal[];
	totalCalories: number;
	totalPrice: number;
	menuType: string;
	menuPrice: number;
	savingsPercentage: number;
	monthlyTotalCalories: number;
	monthlyTotalCost: number;
	monthlyTotalSavings: number;
}

export interface IMeal {
	name: string;
	generalType: string;
	specificType: string;
	exactType: string;
	calories: number;
	price: number;
	quantity: number;
}

