import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {IMealAnalysis} from '@/models/ImageUploaderModels';
import {FlashList} from "@shopify/flash-list";
import {Image} from "@/components/ui/image";
import {adjustTime} from "@/utils/TimeUtils";
import {useMealAnalysisStore} from "@/store/MealAnalysisStore";

export default function ModalScreen() {
	const mealAnalyses = useMealAnalysisStore((state) => state.mealAnalyses);

	const {result} = useLocalSearchParams();
	const mealAnalysis: IMealAnalysis = mealAnalyses.find((analysis) => analysis.id === result) as IMealAnalysis;

	return (
		<ScrollView style={styles.container}>

			{typeof mealAnalysis.image !== "undefined" && (
					<Image source={{uri: `data:image/jpeg;base64,${mealAnalysis.image}`}} size={"2xl"} className="!w-full" alt={"Yemek Analizi"}/>
			)}
			{typeof mealAnalysis.createdAt !== "undefined" && (
				<Text style={styles.subtitle}>Analiz Tarihi: {mealAnalysis.createdAt}
					{typeof mealAnalysis.takenAt !== "undefined" && ` / ${adjustTime(mealAnalysis.takenAt)}`}
				</Text>
			)}
			{typeof mealAnalysis.totalCalories !== "undefined" && (
				<Text style={styles.subtitle}>Toplam Kalori: {mealAnalysis.totalCalories}</Text>
			)}
			{typeof mealAnalysis.totalPrice !== "undefined" && (
				<Text style={styles.subtitle}>Toplam Fiyat: {mealAnalysis.totalPrice} TL</Text>
			)}
			{typeof mealAnalysis.menuType !== "undefined" && (
				<Text style={styles.subtitle}>Menü Türü: {mealAnalysis.menuType}</Text>
			)}
			{typeof mealAnalysis.menuPrice !== "undefined" && (
				<Text style={styles.subtitle}>Menü Fiyatı: {mealAnalysis.menuPrice} TL</Text>
			)}
			{typeof mealAnalysis.savingsPercentage !== "undefined" && (
				<Text style={styles.subtitle}>Tasarruf Yüzdesi: {mealAnalysis.savingsPercentage}%</Text>
			)}
			{typeof mealAnalysis.monthlyTotalCalories !== "undefined" && (
				<Text style={styles.subtitle}>Aylık Toplam Kalori: {mealAnalysis.monthlyTotalCalories}</Text>
			)}
			{typeof mealAnalysis.monthlyTotalCost !== "undefined" && (
				<Text style={styles.subtitle}>Aylık Toplam Maliyet: {mealAnalysis.monthlyTotalCost} TL</Text>
			)}
			{typeof mealAnalysis.monthlyTotalSavings !== "undefined" && (
				<Text style={styles.subtitle}>Aylık Toplam Tasarruf: {mealAnalysis.monthlyTotalSavings}%</Text>
			)}
			<Text style={styles.title}>Yemek Listesi</Text>
			<FlashList
				data={mealAnalysis.meals}
				estimatedItemSize={5}
				keyExtractor={(item) => item.name}
				renderItem={({item}) => (
					<View style={styles.mealItem}>
						{typeof item.name !== "undefined" && <Text style={styles.mealText}>Adı: {item.name}</Text>}
						{typeof item.generalType !== "undefined" && <Text style={styles.mealText}>Türü: {item.generalType}</Text>}
						{typeof item.specificType !== "undefined" &&
							<Text style={styles.mealText}>Alt Türü: {item.specificType}</Text>}
						{typeof item.exactType !== "undefined" &&
							<Text style={styles.mealText}>En alt Türü: {item.exactType}</Text>}
						{typeof item.calories !== "undefined" && <Text style={styles.mealText}>Kalori: {item.calories}</Text>}
						{typeof item.price !== "undefined" && <Text style={styles.mealText}>Fiyat: {item.price} TL</Text>}
						{typeof item.quantity !== "undefined" && <Text style={styles.mealText}>Miktar: {item.quantity}</Text>}
					</View>
				)}
			/>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 18,
		marginBottom: 5,
	},
	mealItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
	},
	mealText: {
		fontSize: 16,
	},
});
