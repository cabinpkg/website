import { VStack, Heading, Text, HStack, Spacer } from "@chakra-ui/react";
import type { User } from "@supabase/supabase-js";
import {
    getUser,
    supabaseServerClient,
} from "@supabase/supabase-auth-helpers/nextjs";
import { ViewIcon } from "@chakra-ui/icons";
import type { GetServerSideProps } from "next";

import NeedAuth from "~/components/NeedAuth";
import Meta from "~/components/Meta";
import type { PackageOverview } from "~/utils/types";
import Package from "~/components/Package";
import { Link } from "~/components/Link";

interface DashboardPageProps {
    user: User;
    packages: PackageOverview[];
}

function DashboardPage(props: DashboardPageProps): JSX.Element {
    return (
        <VStack spacing={5}>
            <Heading>Dashboard</Heading>
            <HStack>
                <Text>My packages</Text>
                <Spacer />
                <ViewIcon />
                <Link href={`/users/${props.user.user_metadata["user_name"]}`}>
                    Show all
                </Link>
            </HStack>
            {props.packages.length > 0 ? (
                <VStack spacing={5}>
                    {props.packages.map((p) => (
                        <Package key={p.id} package={p} />
                    ))}
                </VStack>
            ) : (
                <Text>no packages to show</Text>
            )}
        </VStack>
    );
}

interface DashboardProps {
    user: User;
    packages: PackageOverview[];
}

export default function Dashboard(props: DashboardProps): JSX.Element {
    return (
        <>
            <Meta title="Dashboard" />
            {props.user ? (
                <DashboardPage user={props.user} packages={props.packages} />
            ) : (
                <NeedAuth />
            )}
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { user } = await getUser(context);

    if (!user) {
        return {
            props: {
                user,
                packages: [],
            },
        };
    }

    const { data, error } = await supabaseServerClient(context)
        .rpc<PackageOverview>(
            "get_owned_packages",
            { username: user.user_metadata["user_name"] },
            { count: "exact" },
        )
        .select("id, name, version, description, edition")
        .range(0, 5);
    if (error) {
        console.error(error);
    }

    return {
        props: {
            user,
            packages: data ?? [],
        },
    };
};
