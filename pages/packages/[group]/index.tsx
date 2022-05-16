import type { GetServerSideProps } from "next";
import { supabaseServerClient } from "@supabase/supabase-auth-helpers/nextjs";
import { VStack, Text } from "@chakra-ui/react";

import type { Package as PackageType } from "~/utils/types";
import { PER_PAGE } from "~/utils/constants";
import SearchResult from "~/components/SearchResult";

interface GroupProps {
    packages: PackageType[];
    group: string;
    perPage: number;
    page: number;
    totalCount: number;
}

export default function Group(props: GroupProps): JSX.Element {
    return (
        <VStack>
            <Text>Packages owned by <Text as="b">{props.group}</Text></Text>
            <SearchResult
                packages={props.packages}
                group={props.group}
                pathname={`/packages/${props.group}`}
                perPage={props.perPage}
                page={props.page}
                totalCount={props.totalCount}
            />
        </VStack>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const group = context.query.group;
    const page = context.query.page ? +context.query.page : 1;
    const perPage = context.query.perPage ? +context.query.perPage : PER_PAGE;

    let request = supabaseServerClient(context)
        .rpc<PackageType>("get_uniq_packages", {}, { count: "exact" })
        .select("*"); // TODO: Improve selection: name, total downloads, updated_at, ...
    request = request.like("name", `${group}/%`);

    const startIndex = (page - 1) * perPage;
    request = request.range(startIndex, startIndex + (perPage - 1));

    const { data, count } = await request;
    if (data && count) {
        return {
            props: {
                packages: data,
                group,
                perPage,
                page,
                totalCount: count,
            },
        };
    }
    return {
        notFound: true,
    };
};
