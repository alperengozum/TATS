import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, Pressable, ActivityIndicator} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {useMealAnalysisStore} from '@/store/MealAnalysisStore';
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
import {Button, ButtonIcon} from "@/components/ui/button";
import {Heading} from "@/components/ui/heading";
import {useRouter} from 'expo-router';
import {IMealAnalysis} from "@/models/ImageUploaderModels";

export default function MealAnalysisActionSheet({isOpen, setIsOpen}: {
	isOpen: boolean,
	setIsOpen: (open: boolean) => void
}) {
	const [loadingFiles, setLoadingFiles] = useState<string[]>([]);
	const mealAnalyses = useMealAnalysisStore((state) => state.mealAnalyses?.sort((a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix()));
	const initializeMealAnalysesFromAsyncStorage = useMealAnalysisStore((state) => state.initializeMealAnalysesFromAsyncStorage);
	const removeMealAnalysis = useMealAnalysisStore((state) => state.removeMealAnalysis);
	const router = useRouter();
	const keyExtractor = useCallback((item: any, i: number) => `${i}-${item.id}`, []);

	const loadMoreFiles = () => {
		// Load more files
	};

	useEffect(() => {
		initializeMealAnalysesFromAsyncStorage();
	}, []);

	const handleDelete = async (analysis: IMealAnalysis) => {
		setLoadingFiles((prev) => [...prev, analysis.id]);
		try {
			removeMealAnalysis(analysis);
		} catch (error) {
			console.error(error);
		} finally {
			setLoadingFiles((prev) => prev.filter((id) => id !== analysis.id));
		}
	};

	const onPressItem = async (item: IMealAnalysis) => {
		router.push({
			pathname: '/modal',
			params: {result: JSON.stringify(item)}
		});
		setIsOpen(false);
	};

	return (
		<VStack>
			<UIActionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<ActionsheetBackdrop onPress={() => setIsOpen(false)}/>
				<ActionsheetContent>
					<ActionsheetDragIndicatorWrapper>
						<ActionsheetDragIndicator/>
					</ActionsheetDragIndicatorWrapper>
					{mealAnalyses.length === 0 ? <Text className={"pb-3 pt-5"}>Gösterilecek bir analiz bulunmamaktadır..</Text> :
						<View className={"min-w-full h-96"}>
							<FlashList
								data={mealAnalyses}
								ListHeaderComponent={
									<View className={"flex items-center p-4"}>
										<Heading className={"text-typography-black items-center justify-center"}>Geçmiş analizler</Heading>
									</View>
								}
								renderItem={({item, index}: { item: IMealAnalysis, index: number }) => (
									<ActionsheetItem key={keyExtractor(item, index)} onPress={() => onPressItem(item)}>
										<HStack space="md" className={"flex flex-1 items-center justify-between"}>
											<VStack className={"w-[90%]"}>
												<MotiImage
													source={{uri: `data:image/jpeg;base64,${item.image}`}}
													className={""}
													style={{width: "100%", height: 100, borderRadius: 10}}
													transition={{
														type: 'timing',
														duration: 1000,
													}}
												/>
												<Text className={"text-typography-500"}>{moment(item.createdAt).fromNow()}</Text>
											</VStack>
											{loadingFiles.includes(item.id) ? (
												<ActivityIndicator size="small" color="#be123c"/>
											) : (
												<Button size="lg" action={"negative"} variant={"link"} className="rounded-full p-3.5"
												        onPress={() => handleDelete(item)}>
													<ButtonIcon as={Trash2Icon}/>
												</Button>
											)}
										</HStack>
									</ActionsheetItem>
								)}
								keyExtractor={keyExtractor}
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
