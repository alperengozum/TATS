import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ActivityIndicator} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {ICompressedFile, useCompressedStore} from '@/store/MealAnalysisStore';
import {
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetItem,
	UIActionsheet
} from "@/components/ui/actionsheet";
import {VStack} from "@/components/ui/vstack";
import {MotiImage} from "moti";
import {HStack} from "@/components/ui/hstack";
import moment from "moment";
import {Trash2Icon} from "lucide-react-native";
import {Button, ButtonIcon, ButtonText} from "@/components/ui/button";
import * as FileSystem from 'expo-file-system';
import {Heading} from "@/components/ui/heading";
import * as Sharing from "expo-sharing";

export default function CompressedFilesActionSheet({isOpen, setIsOpen}: {
	isOpen: boolean,
	setIsOpen: (open: boolean) => void
}) {
	const [loadingFiles, setLoadingFiles] = useState<string[]>([]);
	const compressedFiles = useCompressedStore((state) => state.compressedFiles?.sort((a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix()));
	const initializeCompressedFilesFromAsyncStorage = useCompressedStore((state) => state.initializeCompressedFilesFromAsyncStorage);
	const removeCompressedFile = useCompressedStore((state) => state.removeCompressedFile);

	const loadMoreFiles = () => {
		// Load more files
	};

	useEffect(() => {
		initializeCompressedFilesFromAsyncStorage();
	}, []);


	const handleDelete = async (file: ICompressedFile) => {
		setLoadingFiles((prev) => [...prev, file._id]);
		try {
			await FileSystem.deleteAsync(file.uri);
			removeCompressedFile(file);
		} catch (error) {
			console.error(error);
		} finally {
			setLoadingFiles((prev) => prev.filter((id) => id !== file._id))
		}
	};

	const onPressItem = async (item: ICompressedFile) => {
		if (await Sharing.isAvailableAsync()) {
			await Sharing.shareAsync(item.uri);
		} else {
			console.log('Sharing is not available on this device');
		}
	}

	return (
		<VStack>
			<UIActionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<ActionsheetBackdrop onPress={() => setIsOpen(false)}/>
				<ActionsheetContent>
					<ActionsheetDragIndicatorWrapper>
						<ActionsheetDragIndicator/>
					</ActionsheetDragIndicatorWrapper>
					{compressedFiles.length === 0 ? <Text>No files to display</Text> :
						<View className={"min-w-full h-96"}>
							<FlashList
								data={compressedFiles}
								ListHeaderComponent={
									<View className={"flex items-center p-4"}>
										<Heading className={"text-typography-black items-center justify-center"}>Compressed Files</Heading>
									</View>
								}
								renderItem={({item}: { item: ICompressedFile }) => (
									<ActionsheetItem key={item._id} onPress={() => onPressItem(item)}>
										<HStack space="md" className={"flex flex-1 items-center justify-between w-full"}>
											<MotiImage
												source={{uri: item.uri}}
												className={""}
												style={{width: 100, height: 100, borderRadius: 10}}
												transition={{
													type: 'timing',
													duration: 1000,
												}}
											/>
											<VStack className={"w-[30vw] text-start"}>
												<Text className={"text-typography-black line-clamp-2"}>{item.name}</Text>
												<Text className={"text-typography-500"}>{moment(item.createdAt).fromNow()}</Text>
											</VStack>
											{loadingFiles.includes(item._id) ? (
												<ActivityIndicator size="small" color="#0EA5E9"/>
											) : (
												<Button size="lg" action={"negative"} variant={"link"} className="rounded-full p-3.5"
												        onPress={() => handleDelete(item)}>
													<ButtonIcon as={Trash2Icon}/>
												</Button>
											)}
										</HStack>
									</ActionsheetItem>
								)}
								keyExtractor={(item) => item._id}
								onEndReached={loadMoreFiles}
								onEndReachedThreshold={0.5}
								estimatedItemSize={50}
							/>
						</View>
					}
				</ActionsheetContent>
			</UIActionsheet>
		</VStack>
	);
}
