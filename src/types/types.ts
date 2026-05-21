
export const role = ["contributor", "maintainer"] as const

export type Role = (typeof role)[number]


export type User ={

    id: number,
    name: string,
    password: string,
    role: Role,
    email: string,
    created_at: Date,
    update_at:Date

}

export type Ruser = Omit<User, "update_at" | "created_at" | "password" | "email">


export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";


export type Issues = {
    id: number,
    title: string,
    description:string,
    type: IssueType,
    status:IssueStatus
    reporter_id:number
    created_at:Date,
    updated_at:Date
}
export type Rissues = Omit<Issues, "id" | "updated_at" | "created_at" > 