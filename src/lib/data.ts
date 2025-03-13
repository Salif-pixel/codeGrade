import {prisma} from "@src/lib/prisma";

export const get_user = async (id: string | "") => {
    const user = await prisma.user.findFirst({
        where: {
            id
        },
        include: {
            accounts: true,
        }
    });
    return user;
}
export const get_users = async ()=>{
    const users = await prisma.user.findMany({
        include: {
            accounts: true,
        }
    });
    return users;
};