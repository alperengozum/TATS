import React, {useEffect, useState} from 'react';
import {MotiView, MotiText} from "moti";
import {Dimensions, Pressable, ActivityIndicator, Text, TextInput, View, Modal, TouchableOpacity} from "react-native";
import CompressWellIcon from "@/components/icons/CompressWellIcon";
import {Heading} from "@/components/ui/heading";
import {Easing} from "react-native-reanimated";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {Progress, ProgressFilledTrack} from "@/components/ui/progress";
import {Svg, Circle} from 'react-native-svg';
import {useCompressedStore, ICompressedFile} from "@/store/CompressedStore";
import CompressedFilesActionSheet from "@/components/actionsheets/CompressedFilesActionSheet";
import LottieView from 'lottie-react-native';
import {HStack} from "@/components/ui/hstack";
import {Button, ButtonText} from "@/components/ui/button";
import SelectUploadTypeActionSheet from "@/components/actionsheets/SelectUploadTypeActionSheet";

export default function TabOneScreen() {
	const {width, height} = Dimensions.get('window');
	const customEasing = Easing.bezier(0.37, 0, 0.63, 1);
	const [loading, setLoading] = useState(false);
	const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [url, setUrl] = useState('');
	const [ftpUrl, setFtpUrl] = useState('');
	const [uploadType, setUploadType] = useState<string | undefined>('');
	const [isUploadTypeActionSheetOpen, setIsUploadTypeActionSheetOpen] = useState(false);
	const addCompressedFile = useCompressedStore((state) => state.addCompressedFile);

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
			let compressedFile: ICompressedFile = {
				_id: '',
				uri: url,
				type: 'image',
				createdAt: new Date(),
				updatedAt: new Date()
			};
			addCompressedFile(compressedFile);
			if (await Sharing.isAvailableAsync()) {
				await Sharing.shareAsync(url);
			} else {
				console.log('Sharing is not available on this device');
			}
			setLoading(false);
			setIsActionSheetOpen(true);
		} else {
			alert('Invalid URL');
		}
	};

	const handleGalleryUpload = async () => {
		setLoading(true);
		setIsModalVisible(false);
		const response = await DocumentPicker.getDocumentAsync({type: ["image/*"]});
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
			setIsModalVisible(false);
			await sendImageToServer(result.assets[0].uri);
			setLoading(false);
			setIsActionSheetOpen(true);
		}
		setUploadType(undefined);
	};


	const sendImageToServer = async (uri: string) => {
		const base64 = await FileSystem.readAsStringAsync(uri, {encoding: FileSystem.EncodingType.Base64});
		console.log('Base64:', base64.slice(0, 100));
		try {
			const response = await fetch('https://DEMOURL', {
				method: 'POST',
				body: JSON.stringify({image: base64}),
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const result = await response.json();
			console.log(result);
		} catch (error) {
			console.error('Error uploading image:', error);
		}
		setUploadType(undefined);
	};

	return (
		<View className={"w-full h-full"}>
			<MotiView className={"w-[100vw] h-[100vh] flex-1 flex items-center justify-center"}
			          from={{backgroundColor: "#E0F2FE"}}
			          animate={{backgroundColor: "#BAE6FD"}}
			          transition={{type: 'timing', duration: 3000}}>
				<Pressable onPress={onUploadPress} className={"justify-center items-center"}>
					<MotiText className={"text-base font-medium text-lightBlue-600 pb-3 z-10"}
					          from={{scale: 1}}
					          animate={{scale: !loading ? 1.5 : 1}}
					          transition={{type: 'timing', duration: 1000, loop: true, easing: customEasing}}>
						Tap to upload
					</MotiText>
					<MotiView className={"rounded-b-full static"}>
						<MotiView
							from={{scale: 1}}
							animate={{scale: 1.2}}
							transition={{type: 'timing', duration: 1000, loop: true, easing: customEasing}}
							style={{position: 'absolute', zIndex: -1}}
						>
							<Svg height={width / 2} width={width / 2}>
								<Circle cx="50%" cy="50%" r="50%" fill="#E0F2FE"/>
							</Svg>
						</MotiView>
						<View className={"rounded-b-full overflow-hidden"}>
							<CompressWellIcon width={width / 2} height={width / 2}/>
						</View>
					</MotiView>
				</Pressable>
				<MotiView className={"flex px-[10%] pt-10"}>
					<View>
						<Heading className={"racking-widest text-lightBlue-700"} size={"2xl"}>Select Image,</Heading>
						<Heading className={"tracking-widest text-lightBlue-700"} size={"2xl"}>Video or Audio for</Heading>
					</View>
					<Heading className={"tracking-[0.2rem] text-lightBlue-900 pt-5"} size={"3xl"}>Compress Well.</Heading>
				</MotiView>
				{loading && (
					<ActivityIndicator size="large" color="#0EA5E9"/>
				)}
				{progress > 0 && progress < 100 && (
					<Progress value={progress} className="w-[300px]" size="md">
						<ProgressFilledTrack/>
					</Progress>
				)}
				<MotiView className={"absolute h-20 bottom-0"}>
					<LottieView
						source={require("../../assets/lottie/swipe-up.json")}
						style={{
							position: 'absolute',
							bottom: 0,
							width: '100%',
							height: 40
						}}
						autoPlay
						loop/>
					<MotiText className={"text-sm font-medium text-lightBlue-600 pb-3 z-10"}>
						Swipe up to view compressed files
					</MotiText>
				</MotiView>
				<CompressedFilesActionSheet isOpen={isActionSheetOpen} setIsOpen={setIsActionSheetOpen}/>
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
					style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}
					onPress={() => setIsModalVisible(false)}>
					<TouchableOpacity activeOpacity={1}
					                  style={{width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10}}
					                  onPress={(e) => e.stopPropagation()}>
						<HStack className={"flex justify-between items-center align-middle pb-4"}>
							<Text style={{fontSize: 18, fontWeight: 'bold'}}>Enter URL</Text>
							<Button variant={"link"} onPress={() => setIsModalVisible(false)}>
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
		</View>
	);
}
