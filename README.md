# Executando

Para executar o projeto basta usar o comando:

```bash
bash run.sh
```

**Observação**

Caso não tenha o `butane`, para a geração do `config.yml`, o comadno utilizado deverá ser: `docker run --interactive -t --rm --entrypoint /bin/bash quay.io/coreos/butane:release`. Copie o diretório `db` e `web`, além do arquivo `config.yml` e compile diretamente com o comando: `butane -d . --pretty --strict config.yml >config.ign`, ao final copie o `config.ign` para a sua máquina.

# Monitorando Execução

Por padrão o script não força o uso de SSH, isso pode deixar dificil a visualização do que está sendo executado. Caso queira é possível adicionar uma chave, descomentando o arquivo `config.yml` e colocando sua chave pública no lugar do `${SSH_KEY}`.

Um comando muito útil para visualizar se os processo de build está acontecendo é o `journalctl --follow -u build-images.service`. Ao finalizar o processo é possível verificar os serviços `db.service` e `web.service` normalmente com o `systemctl`.