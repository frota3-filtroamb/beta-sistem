export type Role = 'gestor' | 'porteiro'

export type Permissao =
  | 'veiculos'
  | 'portaria'
  | 'liberacao'
  | 'transferencia'
  | 'encomendas'

const PERMISSOES_GESTOR: Permissao[] = [
  'veiculos',
  'portaria',
  'liberacao',
  'transferencia',
  'encomendas',
]

const PERMISSOES_PORTEIRO: Permissao[] = ['portaria']

export function getRole(
  user: { publicMetadata?: Record<string, unknown> } | null | undefined
): Role {
  const role = user?.publicMetadata?.role
  if (role === 'porteiro') return 'porteiro'
  return 'gestor'
}

export function getPermissoes(
  user: { publicMetadata?: Record<string, unknown> } | null | undefined
): Permissao[] {
  const custom = user?.publicMetadata?.permissoes

  if (Array.isArray(custom) && custom.length > 0) {
    return custom as Permissao[]
  }

  return getRole(user) === 'porteiro' ? PERMISSOES_PORTEIRO : PERMISSOES_GESTOR
}

export function podeAcessar(
  user: { publicMetadata?: Record<string, unknown> } | null | undefined,
  permissao: Permissao
): boolean {
  return getPermissoes(user).includes(permissao)
}