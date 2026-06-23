#Tokens assinados para o QR da carteirinha.

#O QR deixa de carregar o id sequencial cru do passageiro (falsificável) e passa
#a carregar um token assinado com a SECRET_KEY do Django. Assim, só o backend
#consegue emitir um QR válido e qualquer adulteração é detectada na leitura.

from django.core import signing

_SALT = 'carteirinha-embarque'


def gerar_token(perfil_passageiro_id):
    #Gera o token assinado para o id de um PerfilPassageiro.
    return signing.dumps(int(perfil_passageiro_id), salt=_SALT)


def ler_token(token, max_age=None):
    #Devolve o id do perfil embutido no token.

    #Levanta `signing.BadSignature` se o token for inválido/adulterado.
    
    return signing.loads(token, salt=_SALT, max_age=max_age)
