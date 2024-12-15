// mobile/app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { MotiView, MotiText } from "moti";
import { Dimensions, Pressable, ActivityIndicator, Text, TextInput, View, Modal, TouchableOpacity } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Easing } from "react-native-reanimated";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import SelectUploadTypeActionSheet from "@/components/actionsheets/SelectUploadTypeActionSheet";
import { Image } from "@/components/ui/image";
import { IMealAnalysis } from "@/models/ImageUploaderModels";
import { useMealAnalysisStore } from "@/store/MealAnalysisStore";
import { useRouter } from 'expo-router';

export default function TabOneScreen() {
	const customEasing = Easing.bezier(0.37, 0, 0.63, 1);
	const [loading, setLoading] = useState(false);
	const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [url, setUrl] = useState('');
	const [ftpUrl, setFtpUrl] = useState('');
	const [uploadType, setUploadType] = useState<string | undefined>('');
	const [isUploadTypeActionSheetOpen, setIsUploadTypeActionSheetOpen] = useState(false);
	const addMealAnalysis = useMealAnalysisStore((state) => state.addMealAnalysis);
	const router = useRouter();

	useEffect(() => {
		switch (uploadType) {
			case 'gallery':
				handleGalleryUpload();
				break;
			case 'camera':
				handleCameraUpload();
				break;
			case 'ftp':
				break;
			case 'http':
				setUrl("");
				break;
			default:
				break;
		}
	}, [uploadType]);

	const isValidUrl = (url: string) => {
		const pattern = new RegExp('^(https?:\\/\\/|ftp:\\/\\/)?' + // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
			'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
		return !!pattern.test(url);
	};

	const onUploadPress = () => {
		setIsUploadTypeActionSheetOpen(true);
	};

	const handleUrlSubmit = async () => {
		if (isValidUrl(url)) {
			setLoading(true);
			setIsModalVisible(false);
			await sendImageToServer(url);

			setLoading(false);
			setIsActionSheetOpen(true);
		} else {
			alert('Invalid URL');
		}
	};

	const handleGalleryUpload = async () => {
		setLoading(true);
		setIsModalVisible(false);
		const response = await DocumentPicker.getDocumentAsync({ type: ["image/*"] });
		if (response.canceled) {
			setLoading(false);
			return;
		}
		response.assets?.forEach(async (asset: DocumentPicker.DocumentPickerAsset) => {
			await sendImageToServer(asset.uri);
			setLoading(false);
			setIsActionSheetOpen(true);
		});

		setUploadType(undefined);
	};

	const handleCameraUpload = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== 'granted') {
			alert('Sorry, we need camera permissions to make this work!');
			return;
		}
		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			quality: 1,
		});
		if (!result.canceled) {
			setLoading(true);
			setIsModalVisible(false);
			await sendImageToServer(result.assets[0].uri);
			setLoading(false);
			setIsActionSheetOpen(true);
		}
		setUploadType(undefined);
	};

	const sendImageToServer = async (uri: string) => {
		const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
		console.log('Base64:', base64.slice(0, 100));
		try {
			//TODO Implement the actual API call
/*			const response = await fetch('https://DEMOURL', {
				method: 'POST',
				body: JSON.stringify({
					image: base64,
					takenAt: new Date().getTime(),
					createdAt: new Date().getTime()
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const result: IMealAnalysis = await response.json();*/
			const result: IMealAnalysis = {
				id: '1',
				image: base64,
				createdAt: new Date().getTime(),
				meals: [
					{
						name: 'Test Meal',
						generalType: 'Test General Type',
						specificType: 'Test Specific Type',
						exactType: 'Test Exact Type',
						calories: 100,
						price: 10,
						quantity: 1
					},
					{
						name: 'Test Meal 2',
						generalType: 'Test General Type 2',
						specificType: 'Test Specific Type 2',
						exactType: 'Test Exact Type 2',
						calories: 200,
						price: 20,
						quantity: 2
					},
					{
						name: 'Test Meal 3',
						generalType: 'Test General Type 3',
						specificType: 'Test Specific Type 3',
						exactType: 'Test Exact Type 3',
						calories: 300,
						price: 30,
						quantity: 3
					}
				],
				totalCalories: 0,
				totalPrice: 0,
				menuType: 'Fix Menu',
				menuPrice: 0,
				savingsPercentage: 0,
				monthlyTotalCalories: 0,
				monthlyTotalCost: 0,
				monthlyTotalSavings: 0
			}
			addMealAnalysis(result);
			router.push({
				pathname: '/modal',
				params: { result: JSON.stringify(result) }
			});
		} catch (error) {
			console.error('Error uploading image:', error);
		}
		setUploadType(undefined);
	};

	return (
		<View className={"w-full h-full"}>
			<MotiView className={"w-[100vw] h-[100vh] flex-1 flex items-center justify-center"}
			          from={{ backgroundColor: "#fee0eb" }}
			          animate={{ backgroundColor: "#ffccdc" }}
			          transition={{ type: 'timing', duration: 3000 }}>
				<Pressable onPress={onUploadPress} className={"justify-center items-center"}>
					<MotiText className={"text-base font-medium text-rose-600 -ml-1 pb-10 z-10"}
					          from={{ scale: 1 }}
					          animate={{ scale: !loading ? 1.5 : 1 }}
					          transition={{ type: 'timing', duration: 1000, loop: true, easing: customEasing }}>
						Yüklemek için tıkla
					</MotiText>
					<MotiView className={"rounded-full flex h-30"}>
						<MotiView
							from={{ scale: 1 }}
							animate={{ scale: 1.1 }}
							transition={{ type: 'timing', duration: 1000, loop: true, easing: customEasing }}
							className={"rounded-full border-4 border-gray-600"}
						>
							<Image source={require('../../assets/images/Yemekhane.png')} className={"h-60 w-60 rounded-full"}
							       alt={"yemekhane"} />
						</MotiView>
					</MotiView>
				</Pressable>
				<MotiView className={"flex px-[10%] pt-10"}>
					<View>
						<Heading className={"racking-widest text-rose-700"} size={"2xl"}>Tepsi analizi için</Heading>
					</View>
					<Heading className={"tracking-[0.2rem] text-rose-900 pt-5"} size={"3xl"}>Resim yükleyin.</Heading>
				</MotiView>
				{loading && (
					<ActivityIndicator size="large" color="#0EA5E9" />
				)}
				{progress > 0 && progress < 100 && (
					<Progress value={progress} className="w-[300px]" size="md">
						<ProgressFilledTrack />
					</Progress>
				)}
			</MotiView>
			<SelectUploadTypeActionSheet
				isOpen={isUploadTypeActionSheetOpen}
				setIsOpen={setIsUploadTypeActionSheetOpen}
				setUploadType={setUploadType}
				setIsUrlModalVisible={setIsModalVisible}
			/>
			<Modal
				animationType="slide"
				transparent={true}
				visible={isModalVisible}
				onRequestClose={() => setIsModalVisible(false)}
			>
				<TouchableOpacity
					style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
					onPress={() => setIsModalVisible(false)}>
					<TouchableOpacity activeOpacity={1}
					                  style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}
					                  onPress={(e) => e.stopPropagation()}>
						<HStack className={"flex justify-between items-center align-middle pb-4"}>
							<Text style={{ fontSize: 18, fontWeight: 'bold' }}>Enter URL</Text>
							<Button variant={"link"} onPress={() => setIsModalVisible(false)}>
								<ButtonText>X</ButtonText>
							</Button>
						</HStack>
						<TextInput
							style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 20, paddingHorizontal: 10 }}
							placeholder="Enter URL (http://example.com/image.jpg)"
							onChangeText={setUrl}
							value={url}
						/>
						<Button onPress={handleUrlSubmit}>
							<ButtonText>Submit URL</ButtonText>
						</Button>
					</TouchableOpacity>
				</TouchableOpacity>
			</Modal>
		</View>
	);
}
