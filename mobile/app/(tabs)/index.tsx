import React, {useEffect, useState} from 'react';
import {MotiView, MotiText} from "moti";
import {
	Dimensions,
	Pressable,
	ActivityIndicator,
	Text,
	TextInput,
	View,
	Modal,
	TouchableOpacity,
	Alert
} from "react-native";
import {Heading} from "@/components/ui/heading";
import {Easing} from "react-native-reanimated";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {Progress, ProgressFilledTrack} from "@/components/ui/progress";
import {HStack} from "@/components/ui/hstack";
import {Button, ButtonText} from "@/components/ui/button";
import SelectUploadTypeActionSheet from "@/components/actionsheets/SelectUploadTypeActionSheet";
import {Image} from "@/components/ui/image";
import {IMealAnalysis} from "@/models/ImageUploaderModels";
import {useMealAnalysisStore} from "@/store/MealAnalysisStore";
import {useRouter} from 'expo-router';
import LottieView from "lottie-react-native";
import {AnimatePresence} from "@legendapp/motion";
import {SwipeGesture} from "react-native-swipe-gesture-handler";
import MealAnalysisActionSheet from "@/components/actionsheets/MealAnalysisActionSheet";
import moment from "moment/moment";
import 'moment/locale/tr';

export default function TabOneScreen() {
	moment.locale('tr');
	const customEasing = Easing.bezier(0.37, 0, 0.63, 1);
	const [loading, setLoading] = useState(false);
	const [serverLoading, setServerLoading] = useState(false);
	const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isUrlModalVisible, setIsUrlModalVisible] = useState(false);
	const [url, setUrl] = useState('');
	const [ftpUrl, setFtpUrl] = useState('');
	const [uploadType, setUploadType] = useState<string | undefined>('');
	const [isUploadTypeActionSheetOpen, setIsUploadTypeActionSheetOpen] = useState(false);
	const [takenAt, setTakenAt] = useState(new Date().toISOString().split('T')[0]);
	const addMealAnalysis = useMealAnalysisStore((state) => state.addMealAnalysis);
	const router = useRouter();

	const onSwipePerformed = (direction: string) => {
		if (direction == "up") {
			setIsActionSheetOpen(true);
		}
	}

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
			setIsUrlModalVisible(false);
			setIsModalVisible(true);
		} else {
			alert('Invalid URL');
		}
	};

	const handleTakenAtSubmit = async () => {
		if(serverLoading) return;
		setLoading(true);
		setServerLoading(true)
		setIsModalVisible(false)
		await sendImageToServer(url);
		setUploadType(undefined);
		setUrl('');
		setServerLoading(false);
		setLoading(false);
	};

	const handleGalleryUpload = async () => {
		setLoading(true);
		const response = await DocumentPicker.getDocumentAsync({type: ["image/*"]});
		if (response.canceled) {
			setLoading(false);
			return;
		}
		if(response.assets && response.assets.length >=1){
			setUrl(response.assets[0].uri);
			setIsModalVisible(true);
		}
	};

	const handleCameraUpload = async () => {
		const {status} = await ImagePicker.requestCameraPermissionsAsync();
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
			setUrl(result.assets[0].uri)
			setIsModalVisible(true);
		}
	};

	const sendImageToServer = async (uri: string) => {
		let base64: string;

		try {
			if (uri.startsWith('file://')) {
				base64 = await FileSystem.readAsStringAsync(uri, {encoding: FileSystem.EncodingType.Base64});
			} else {
				const response = await fetch(uri);
				const blob = await response.blob();
				base64 = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(reader.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(blob);
				});
				base64 = base64.split(',')[1];
			}
		} catch (error) {
			console.error('Error reading file:', error);
			Alert.alert('Resmi alırken bir hatayla karşılaşıldı:', error?.message);
			return;
		}

		try {
			// TODO: Implement the actual API call
/*			const result: IMealAnalysis = {
				id: '1',
				image: base64,
				createdAt: new Date().getTime(),
				takenAt: new Date(takenAt).getTime(),
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
			};*/
			const result: IMealAnalysis = await fetch('https://handleimage-5f62hpktuq-uc.a.run.app', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					image: base64,
					takenAt: new Date(takenAt).getTime(),
					createdAt: new Date().getTime()
				})
			}).then((response) => response.json());

			addMealAnalysis(result);
			router.push({
				pathname: '/modal',
				params: {result: JSON.stringify(result)}
			});
		} catch (error) {
			console.error('Error uploading image:', error);
		}
		setUploadType(undefined);
	};

	return (
		<View className={"w-full h-full"}>
			<AnimatePresence>
				<SwipeGesture onSwipePerformed={onSwipePerformed} gestureStyle={{
					flex: 1,
					alignItems: 'center',
					backgroundColor: '#E0F2FE'
				}}>
					<MotiView className={"w-[100vw] h-[100vh] flex-1 flex items-center justify-center"}
					          from={{backgroundColor: "#fee0eb"}}
					          animate={{backgroundColor: "#ffccdc"}}
					          transition={{type: 'timing', duration: 3000}}>
						<Pressable onPress={onUploadPress} className={"justify-center items-center"}>
							<MotiText className={"text-base font-medium text-rose-600 -ml-1 pb-10 z-10"}
							          from={{scale: 1}}
							          animate={{scale: !loading ? 1.5 : 1}}
							          transition={{type: 'timing', duration: 1000, loop: true, easing: customEasing}}>
								Yüklemek için tıklayın
							</MotiText>
							<MotiView className={"rounded-full flex h-30"}>
								<MotiView
									from={{scale: 1}}
									animate={{scale: 1.1}}
									transition={{type: 'timing', duration: 1000, loop: true, easing: customEasing}}
									className={"rounded-full border-4 border-gray-600"}
								>
									<Image source={require('../../assets/images/Yemekhane.png')} className={"h-60 w-60 rounded-full"}
									       alt={"yemekhane"}/>
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
							<ActivityIndicator size="large" color="#be123c"/>
						)}
						{progress > 0 && progress < 100 && (
							<Progress value={progress} className="w-[300px]" size="md">
								<ProgressFilledTrack/>
							</Progress>
						)}
					</MotiView>
					<SelectUploadTypeActionSheet
						isOpen={isUploadTypeActionSheetOpen}
						setIsOpen={setIsUploadTypeActionSheetOpen}
						setUploadType={setUploadType}
						setIsUrlModalVisible={setIsUrlModalVisible}
					/>
					<Modal
						animationType="slide"
						transparent={true}
						visible={isModalVisible}
						onRequestClose={handleTakenAtSubmit}
					>
						<TouchableOpacity
							style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}
							onPress={handleTakenAtSubmit}>
							<TouchableOpacity activeOpacity={1}
							                  style={{width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10}}
							                  onPress={(e) => e.stopPropagation()}>
								<HStack className={"flex justify-between items-center align-middle pb-4"}>
									<Text style={{fontSize: 18, fontWeight: 'bold'}}>Tepsinin resminin çekilme tarihini giriniz.</Text>
									<Button variant={"link"} onPress={handleTakenAtSubmit}>
										<ButtonText>X</ButtonText>
									</Button>
								</HStack>
								<TextInput
									style={{height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 20, paddingHorizontal: 10}}
									placeholder="Enter Date (YYYY-MM-DD)"
									onChangeText={setTakenAt}
									value={takenAt}
								/>
								<Button onPress={handleTakenAtSubmit} disabled={serverLoading}>
									<ButtonText>Submit</ButtonText>
								</Button>
							</TouchableOpacity>
						</TouchableOpacity>
					</Modal>
					<Modal
						animationType="slide"
						transparent={true}
						visible={isUrlModalVisible}
						onRequestClose={() => setIsUrlModalVisible(false)}
					>
						<TouchableOpacity
							style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}
							onPress={() => setIsUrlModalVisible(false)}>
							<TouchableOpacity activeOpacity={1}
							                  style={{width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10}}
							                  onPress={(e) => e.stopPropagation()}>
								<HStack className={"flex justify-between items-center align-middle pb-4"}>
									<Text style={{fontSize: 18, fontWeight: 'bold'}}>Enter URL</Text>
									<Button variant={"link"} onPress={() => setIsUrlModalVisible(false)}>
										<ButtonText>X</ButtonText>
									</Button>
								</HStack>
								<TextInput
									style={{height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 20, paddingHorizontal: 10}}
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
					<MealAnalysisActionSheet isOpen={isActionSheetOpen} setIsOpen={setIsActionSheetOpen}/>
					<MotiView className={"absolute h-20 bottom-0"}>
						<LottieView
							source={require("../../assets/lottie/swipe-up.json")}
							style={{
								position: 'absolute',
								bottom: 0,
								width: '100%',
								height: 40,
							}}
							autoPlay
							loop/>
						<MotiText className={"text-sm font-medium text-rose-600 pb-3 z-10"}
						>
							Eski analizleri görüntülemek için yukarı kaydırın
						</MotiText>
					</MotiView>
				</SwipeGesture>
			</AnimatePresence>
		</View>
	);
}
