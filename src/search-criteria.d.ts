export interface SearchCriteria {
  emailSettings: EmailSettings
  startWith: StartWith
  endWith: EndWith
  contain: Contain
  exactList: ExactList
  equal: Equal
}

export interface Account {
  emailAddress: string
  emailPassword: string
}

export interface EmailSettings {
  sendEmail: boolean
  emailAddress: string
  account: Account
}

export interface StartWith {
  caseSensitive: boolean
  strings: string[]
}

export interface EndWith {
  caseSensitive: boolean
  strings: string[]
}

export interface Contain {
  caseSensitive: boolean
  strings: string[]
}

export interface ExactList {
  caseSensitive: boolean
  lists: List[][]
}

export interface List {
  startOffset: number
  value: string
}

export interface Equal {
  caseSensitive: boolean
  strings: string[]
}
