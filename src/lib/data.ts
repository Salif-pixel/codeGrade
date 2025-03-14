import {prisma} from "@/lib/prisma";

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

export const getExistingSession = async (token: string) => {
    const session = await prisma.session.findFirst({
        where: {
            token: token ?? "",
        },
    });
    return session;
};

export const getExams = async () => {
    const exams = await prisma.exam.findMany({
        include: {
            questions: true,
        }
    });
    return exams;
};