import React from 'react';
import { Button, ButtonText } from "@/components/ui/button";
import {
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	UIActionsheet
} from "@/components/ui/actionsheet";
import {Text} from "@/components/ui/text";
import {HStack} from "@/components/ui/hstack";

export default function SelectUploadTypeActionSheet({ isOpen, setIsOpen, setUploadType, setIsUrlModalVisible }) {
	return (
		<UIActionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
			<ActionsheetBackdrop onPress={() => setIsOpen(false)} />
			<ActionsheetContent>
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>
				<HStack className={"flex !justify-start w-full"}>
				<Text className={"text-xl p-2"}>
					Select upload type:
				</Text>
				</HStack>
				<Button variant={"link"} onPress={() => { setUploadType('camera'); setIsOpen(false); }}>
					<ButtonText>Camera</ButtonText>
				</Button>
				<Button variant={"link"} onPress={() => { setUploadType('gallery'); setIsOpen(false); }}>
					<ButtonText>Gallery</ButtonText>
				</Button>
				<Button variant={"link"} onPress={() => { setUploadType('http'); setIsOpen(false); setIsUrlModalVisible(true); }}>
					<ButtonText>URL</ButtonText>
				</Button>
				<Button variant={"link"} onPress={() => { setUploadType('ftp'); setIsOpen(false); }}>
					<ButtonText>FTP</ButtonText>
				</Button>
			</ActionsheetContent>
		</UIActionsheet>
	);
}
