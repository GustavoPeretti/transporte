"""Permissões por papel (admin / motorista / passageiro).

A fronteira de segurança é o backend: o papel é derivado dos perfis no banco,
nunca de dados enviados pelo cliente. O frontend apenas reflete isso na UI.
"""
from rest_framework import permissions

from .models import PerfilMotorista, PerfilPassageiro


def get_role(user):
    """Deriva o papel do usuário a partir dos perfis. Sem perfil = admin.

    O resultado é memoizado na instância de `user` para evitar consultas
    repetidas dentro da mesma requisição.
    """
    if not user or not user.is_authenticated:
        return None
    cached = getattr(user, '_cached_role', None)
    if cached is not None:
        return cached
    if PerfilMotorista.objects.filter(usuario=user).exists():
        role = 'motorista'
    elif PerfilPassageiro.objects.filter(usuario=user).exists():
        role = 'passageiro'
    else:
        role = 'admin'
    user._cached_role = role
    return role


def is_admin(user):
    return get_role(user) == 'admin'


class IsAdmin(permissions.BasePermission):
    """Apenas administradores (usuários sem perfil de motorista/passageiro)."""

    message = 'Ação restrita a administradores.'

    def has_permission(self, request, view):
        return is_admin(request.user)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Leitura para qualquer autenticado; escrita apenas para admin."""

    message = 'Apenas administradores podem alterar este recurso.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin(user)


class IsMotoristaOrAdmin(permissions.BasePermission):
    """Apenas motoristas ou administradores."""

    message = 'Ação restrita a motoristas ou administradores.'

    def has_permission(self, request, view):
        return get_role(request.user) in ('motorista', 'admin')
