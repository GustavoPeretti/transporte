from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Advertencia, AlocacaoInstituicao, AlocacaoVeiculo, Confirmacao, Instituicao, PerfilMotorista, PerfilPassageiro, Planejamento, Usuario, Veiculo


class UsuarioAdmin(BaseUserAdmin):
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Dados adicionais', {'fields': ('cpf',)}),
    )
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Dados adicionais', {'fields': ('cpf',)}),
    )


admin.site.register(Advertencia)
admin.site.register(AlocacaoInstituicao)
admin.site.register(AlocacaoVeiculo)
admin.site.register(Confirmacao)
admin.site.register(Instituicao)
admin.site.register(PerfilMotorista)
admin.site.register(PerfilPassageiro)
admin.site.register(Planejamento)
admin.site.register(Usuario, UsuarioAdmin)
admin.site.register(Veiculo)
