import {
    Avatar,
    Code,
    Heading,
    HStack,
    ListItem,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
    Text,
    UnorderedList,
    VStack,
    Button,
    StackDivider,
    useClipboard,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUpRightFromSquare,
    faFileLines,
    faLink,
    faTags,
    faScaleBalanced,
    faClipboard,
    faClipboardCheck,
    faFileCode,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { format } from "timeago.js";
import { CalendarIcon, LinkIcon } from "@chakra-ui/icons";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "~/components/CodeBlock";
import type { Package, User } from "~/utils/types";
import { Link } from "~/components/Link";
import { BASE_API_URL } from "~/utils/constants";

interface SubItemProps {
    title: string;
    count?: number;
    children: ReactElement | ReactElement[];
}

function SubItem(props: SubItemProps): JSX.Element {
    return (
        <VStack width="100%" align="left">
            <HStack>
                <Text as="b" fontSize="lg" marginBottom={2}>
                    {props.title}
                </Text>
                {props.count && <Code>{props.count}</Code>}
            </HStack>
            {props.children}
        </VStack>
    );
}

interface PackageSubProps {
    package: Package;
}

function PackageSub(props: PackageSubProps): JSX.Element {
    const installSnippet = `"${props.package.name}" = "${props.package.version}"`;

    const { hasCopied, onCopy } = useClipboard(installSnippet);
    const [owners, setOwners] = useState<User[]>([]);

    useEffect(() => {
        fetch(`${BASE_API_URL}/packages/${props.package.name}/owners`)
            .then((res) => {
                res.json().then((data) => {
                    const users: User[] = [];
                    for (const rawUser of data["data"]) {
                        users.push({
                            id: rawUser["id"],
                            name: rawUser["name"],
                            user_name: rawUser["user_name"],
                            avatar_url: rawUser["avatar_url"],
                        });
                    }
                    setOwners(users);
                });
            })
            .catch((err) => console.error(err));
    }, [props.package.name]);

    return (
        <VStack spacing={5} maxWidth={300} divider={<StackDivider />}>
            <SubItem title="Metadata">
                <HStack>
                    <CalendarIcon />
                    <Text>{format(props.package.published_at)}</Text>
                </HStack>
                <HStack>
                    <FontAwesomeIcon icon={faScaleBalanced} width={20} />
                    <Link
                        href={`https://choosealicense.com/licenses/${props.package.license.toLowerCase()}/`}
                        isExternal
                    >
                        {props.package.license}
                    </Link>
                </HStack>
            </SubItem>
            <SubItem title="Install">
                <Text fontSize="xs">
                    Add the following line to your{" "}
                    <Code fontSize="xs">poac.toml</Code> file:
                </Text>
                <Button
                    onClick={onCopy}
                    rightIcon={
                        hasCopied ? (
                            <FontAwesomeIcon
                                icon={faClipboardCheck}
                                width={15}
                            />
                        ) : (
                            <FontAwesomeIcon icon={faClipboard} width={15} />
                        )
                    }
                >
                    {installSnippet}
                </Button>
            </SubItem>
            {props.package.metadata["package"]["homepage"] && (
                <SubItem title="Homepage">
                    <HStack>
                        <LinkIcon />
                        <Link
                            href={props.package.metadata["package"]["homepage"]}
                            isExternal
                        >
                            {props.package.metadata["package"]["homepage"]}
                        </Link>
                    </HStack>
                </SubItem>
            )}
            {props.package.metadata["package"]["documentation"] && (
                <SubItem title="Documentation">
                    <HStack>
                        <FontAwesomeIcon icon={faFileCode} width={15} />
                        <Link
                            href={
                                props.package.metadata["package"][
                                    "documentation"
                                ]
                            }
                            isExternal
                        >
                            {props.package.metadata["package"]["documentation"]}
                        </Link>
                    </HStack>
                </SubItem>
            )}
            <SubItem title="Repository">
                <HStack>
                    <FontAwesomeIcon icon={faGithub} width={20} />
                    <Link href={props.package.repository} isExternal>
                        {props.package.repository.replace(
                            "https://github.com/",
                            "",
                        )}
                    </Link>
                </HStack>
            </SubItem>
            <SubItem title="Owners" count={owners.length}>
                {owners.map((o) => (
                    <HStack key={o.id}>
                        <Avatar size="xs" name={o.name} src={o.avatar_url} />
                        <Link href={`/users/${o.user_name}`}>{o.name}</Link>
                    </HStack>
                ))}
            </SubItem>
        </VStack>
    );
}

interface PackageMainProps {
    package: Package;
    versions: string[];
    dependents: Package[];
}

function PackageMain(props: PackageMainProps): JSX.Element {
    return (
        <Tabs maxWidth={700}>
            <TabList>
                <Tab>
                    <HStack spacing={2}>
                        <FontAwesomeIcon icon={faFileLines} width={13} />
                        <Text>Readme</Text>
                    </HStack>
                </Tab>
                <Tab>
                    <HStack spacing={1}>
                        <FontAwesomeIcon icon={faTags} width={18} />
                        <Code>{props.versions.length}</Code>
                        <Text>Versions</Text>
                    </HStack>
                </Tab>
                <Tab>
                    <HStack spacing={1}>
                        <FontAwesomeIcon
                            icon={faArrowUpRightFromSquare}
                            width={15}
                        />
                        {props.package.metadata["dependencies"] ? (
                            // @ts-ignore
                            <Code>
                                {
                                    Object.keys(
                                        props.package.metadata["dependencies"],
                                    ).length
                                }
                            </Code>
                        ) : (
                            <Code>0</Code>
                        )}
                        <Text>Dependencies</Text>
                    </HStack>
                </Tab>
                <Tab>
                    <HStack spacing={1}>
                        <FontAwesomeIcon icon={faLink} width={20} />
                        <Code>{props.dependents.length}</Code>
                        <Text>Dependents</Text>
                    </HStack>
                </Tab>
            </TabList>

            <TabPanels>
                <TabPanel>
                    {props.package.readme ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={ChakraUIRenderer({
                                code: CodeBlock,
                            })}
                            skipHtml
                        >
                            {props.package.readme}
                        </ReactMarkdown>
                    ) : (
                        <Text>no readme found</Text>
                    )}
                </TabPanel>
                <TabPanel>
                    <UnorderedList>
                        {props.versions.map((v) => (
                            <ListItem key={v}>
                                <Link
                                    href={`/packages/${props.package.name}/${v}`}
                                >
                                    {v}
                                </Link>
                            </ListItem>
                        ))}
                    </UnorderedList>
                </TabPanel>
                <TabPanel>
                    {props.package.metadata["dependencies"] ? (
                        <UnorderedList>
                            {Object.entries(
                                props.package.metadata["dependencies"],
                            ).map(([name, ver]) => (
                                // @ts-ignore
                                <ListItem key={name}>
                                    {/* @ts-ignore */}
                                    {name}: {ver}
                                </ListItem>
                            ))}
                        </UnorderedList>
                    ) : (
                        <Text>This package has no dependencies.</Text>
                    )}
                </TabPanel>
                <TabPanel>
                    {props.dependents && props.dependents.length > 0 ? (
                        <UnorderedList>
                            {props.dependents.map((d) => (
                                <ListItem key={d.id}>
                                    {d.name}: {d.version}
                                </ListItem>
                            ))}
                        </UnorderedList>
                    ) : (
                        <Text>
                            This package is not used as a dependency yet.
                        </Text>
                    )}
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}

interface PackageHeadingProps {
    package: Package;
}

function PackageHeading(props: PackageHeadingProps): JSX.Element {
    return (
        <VStack spacing={5}>
            <HStack spacing={5}>
                <Heading>{props.package.name}</Heading>
                <Heading>v{props.package.version}</Heading>
                <Tag>C++{props.package.edition.toString().slice(-2)}</Tag>
            </HStack>
            <Heading size="md">{props.package.description}</Heading>
        </VStack>
    );
}

interface PackageDetailsProps {
    package: Package;
    versions: string[];
    dependents: Package[];
}

export default function PackageDetails(
    props: PackageDetailsProps,
): JSX.Element {
    return (
        <VStack spacing={5}>
            <PackageHeading package={props.package} />
            <HStack spacing={5} alignItems="start">
                <PackageMain
                    package={props.package}
                    versions={props.versions}
                    dependents={props.dependents}
                />
                <PackageSub package={props.package} />
            </HStack>
        </VStack>
    );
}
