// mobile/app/modal.tsx
import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { IMealAnalysis } from '@/models/ImageUploaderModels';
import { FlashList } from "@shopify/flash-list";
import { Image } from "@/components/ui/image";

export default function ModalScreen() {
	const { result } = useLocalSearchParams();
	const mealAnalysis: IMealAnalysis = JSON.parse(result as string);

	return (
		<ScrollView style={styles.container}>
			<Image source={{ uri: `data:image/jpeg;base64,${mealAnalysis.image}` }} style={{ width: '100%' }} alt={"Yemek Analizi"} />
			<Text style={styles.subtitle}>Toplam Kalori: {mealAnalysis.totalCalories}</Text>
			<Text style={styles.subtitle}>Toplam Fiyat: {mealAnalysis.totalPrice} TL</Text>
			<Text style={styles.subtitle}>Menü Türü: {mealAnalysis.menuType}</Text>
			<Text style={styles.subtitle}>Menü Fiyatı: {mealAnalysis.menuPrice} TL</Text>
			<Text style={styles.subtitle}>Tasarruf Yüzdesi: {mealAnalysis.savingsPercentage}%</Text>
			<Text style={styles.subtitle}>Aylık Toplam Kalori: {mealAnalysis.monthlyTotalCalories}</Text>
			<Text style={styles.subtitle}>Aylık Toplam Maliyet: {mealAnalysis.monthlyTotalCost} TL</Text>
			<Text style={styles.subtitle}>Aylık Toplam Tasarruf: {mealAnalysis.monthlyTotalSavings}%</Text>
			<Text style={styles.title}>Yemek Listesi</Text>
			<FlashList
				data={mealAnalysis.meals}
				estimatedItemSize={5}
				keyExtractor={(item) => item.name}
				renderItem={({ item }) => (
					<View style={styles.mealItem}>
						<Text style={styles.mealText}>Adı: {item.name}</Text>
						<Text style={styles.mealText}>Türü: {item.generalType}</Text>
						<Text style={styles.mealText}>Alt Türü: {item.specificType}</Text>
						<Text style={styles.mealText}>En alt Türü: {item.exactType}</Text>
						<Text style={styles.mealText}>Kalori: {item.calories}</Text>
						<Text style={styles.mealText}>Fiyat: {item.price} TL</Text>
						<Text style={styles.mealText}>Miktar: {item.quantity}</Text>
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
