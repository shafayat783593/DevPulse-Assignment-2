
export const role = ["contributor", "maintainer"] as const
export type Role = (typeof role)[number]


export type User ={

    id: number,
    name: string,
    password: string,
    role: string,
    email: string,
    created_at: Date,
    update_at:Date

}

export type Ruser = Omit<User, "id" | "update_at" | "created_at" | "password">