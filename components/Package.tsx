import { Heading, HStack, LinkBox, LinkOverlay, Spacer, Tag, Text, VStack } from "@chakra-ui/react";

import type { Package } from "~/utils/types";

interface PackageProps {
    package: Package;
    group?: string;
}

export default function Package(props: PackageProps): JSX.Element {
    return (
        <LinkBox borderWidth="1px" borderRadius="md" boxShadow="md" padding={5} width="30vw" minWidth="100%">
            <HStack>
                <VStack align="left">
                    <HStack spacing={3}>
                        <Heading size="sm" my="2">
                            <LinkOverlay href={"/packages/" + props.package.name}>
                                {props.group ? props.package.name.replace(props.group + "/", "") : props.package.name}
                            </LinkOverlay>
                        </Heading>
                        <Text>v{props.package.version}</Text>
                    </HStack>
                    <Text>{props.package.description}</Text>
                </VStack>
                <Spacer />
                <Tag>C++{props.package.edition.slice(-2)}</Tag>
            </HStack>
        </LinkBox>
    );
}
