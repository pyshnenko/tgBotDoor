export interface userData {
    id: number,
    name: string,
    comment: string
}

export interface savedData {
    admins: number[],
    notAdmins: number[],
    reqUsers: number[],
    timeDelay: number,
    usersData: userData[]
}