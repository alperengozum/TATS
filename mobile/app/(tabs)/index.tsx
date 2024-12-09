import React, {useState} from 'react';
import {MotiView, AnimatePresence, MotiText} from "moti";
import {Dimensions, Pressable, View, ActivityIndicator, Text} from "react-native";
import CompressWellIcon from "@/components/icons/CompressWellIcon";
import {Heading} from "@/components/ui/heading";
import {Easing} from "react-native-reanimated";
import * as DocumentPicker from 'expo-document-picker';
import {Image, Audio, Video} from 'react-native-compressor';
import * as Sharing from 'expo-sharing';
import {Progress, ProgressFilledTrack} from "@/components/ui/progress";
import {Svg, Circle} from 'react-native-svg';
import {useCompressedStore, ICompressedFile} from "@/store/CompressedStore";
import CompressedFilesActionSheet from "@/components/actioonsheets/CompressedFilesActionSheet";
import {SwipeGesture} from "react-native-swipe-gesture-handler";
import LottieView from 'lottie-react-native';

export default function TabOneScreen() {
	const {width, height} = Dimensions.get('window');
	const customEasing = Easing.bezier(0.37, 0, 0.63, 1);
	const [loading, setLoading] = useState(false);
	const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
	const [progress, setProgress] = useState(0);
	const addCompressedFile = useCompressedStore((state) => state.addCompressedFile);

	const onUploadPress = async () => {
		setLoading(true);
		setIsActionSheetOpen(false);
		DocumentPicker.getDocumentAsync({type: ["image/*", "audio/*", "video/*"]}).then((response) => {
			if (response.canceled) {
				setLoading(false);
				return;
			}
			response.assets?.forEach(async (asset: DocumentPicker.DocumentPickerAsset) => {
				let result;
				let compressedFile: ICompressedFile = {
					_id: '',
					uri: '',
					type: '',
					createdAt: new Date(),
					updatedAt: new Date()
				};
				switch (asset.mimeType?.split('/')[0]) {
					case 'image':
						result = await Image.compress(asset.uri, {
							progressDivider: 1,
							downloadProgress: (progress) => {
								console.log('downloadProgress: ', progress);
								setProgress(progress);
							}
						});
						compressedFile = {_id: '', uri: result, type: 'image', createdAt: new Date(), updatedAt: new Date()};
						break;
					case 'audio':
						result = await Audio.compress(asset.uri);
						compressedFile = {_id: '', uri: result, type: 'audio', createdAt: new Date(), updatedAt: new Date()};
						break;
					case 'video':
						result = await Video.compress(asset.uri, {
							progressDivider: 1,
							downloadProgress: (progress) => {
								console.log('downloadProgress: ', progress);
								setProgress(progress);
							}
						});
						compressedFile = {_id: '', uri: result, type: 'video', createdAt: new Date(), updatedAt: new Date()};
						break;
				}
				if (!result) return;
				asset.name && (compressedFile.name = asset.name);
				addCompressedFile(compressedFile);
				if (await Sharing.isAvailableAsync()) {
					await Sharing.shareAsync(result);
				} else {
					console.log('Sharing is not available on this device');
				}
				setLoading(false);
				setIsActionSheetOpen(true);
			});
		});
	};

	const onSwipePerformed = (direction: string) => {
		if (direction == "up") {
			setIsActionSheetOpen(true);
		}
	}
	return (
		<AnimatePresence>
			<SwipeGesture onSwipePerformed={onSwipePerformed} gestureStyle={{
				flex: 1,
				alignItems: 'center',
				backgroundColor: '#E0F2FE'
			}}>
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
						<MotiText className={"text-sm font-medium text-lightBlue-600 pb-3 z-10"}
						>
							Swipe up to view compressed files
						</MotiText>
					</MotiView>
					<CompressedFilesActionSheet isOpen={isActionSheetOpen} setIsOpen={setIsActionSheetOpen}/>
				</MotiView>
			</SwipeGesture>
		</AnimatePresence>
	);
}
