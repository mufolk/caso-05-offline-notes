# Enunciado — Caso 05: Sincronização de notas offline

# Caso 05 — Sincronização de notas offline

Queremos conhecer seu jeito de resolver problemas. Neste desafio, você vai construir uma solução pequena, mostrar como ela funciona e conversar conosco sobre as decisões que tomou.

## O desafio

Pessoas editam notas em dispositivos que ficam desconectados. Implemente um simulador de sincronização que preserve conflitos em vez de sobrescrever trabalho silenciosamente.

Você pode trabalhar a interface de edição ou a troca de informações entre cliente e servidor, simulando os dois no mesmo processo.

## Como deve funcionar

Comece sem notas no servidor. Cada nota tem `id`, texto e um número de revisão. Uma alteração enviada pelo cliente tem `op_id`, `note_id`, `base_revision` e texto.

Uma nota é criada na revisão 1 quando o cliente envia a revisão base 0. Para alterar uma nota existente, a revisão base deve ser igual à revisão atual no servidor. Se for aceita, a alteração troca o texto e aumenta a revisão em 1, mesmo que o texto enviado seja igual ao anterior.

Quando a revisão base não corresponder à esperada, retorne `conflito` e os dados atuais do servidor, ou indique que a nota ainda não existe. Preserve o texto do servidor e a proposta do cliente no resultado dessa operação. Não junte os textos automaticamente nem use o relógio do dispositivo para escolher um vencedor.

Antes de processar, confira os campos da operação. Uma operação inválida não ocupa `op_id`. Para cada operação válida recebida pela primeira vez, guarde seu conteúdo e resultado, mesmo que tenha dado conflito. Se o mesmo `op_id` chegar de novo com o mesmo conteúdo, devolva o resultado original sem aplicar a alteração outra vez. Se chegar com conteúdo diferente, retorne `id_reutilizado`.

Processe a fila na ordem recebida e devolva um resultado por operação. Um erro ou conflito não impede as próximas. O resultado de um reenvio pode conter dados antigos: ele é o recibo da operação original. Uma consulta separada deve mostrar a nota como está agora.

Para resolver um conflito, permita enviar outra operação, com novo `op_id`, o texto escolhido e a revisão base atual. Cliente e servidor podem ser simulados no mesmo processo. Não precisa implementar exclusão, mesclagem automática, edição em tempo real, armazenamento em disco ou comunicação HTTP.

## Um exemplo

Dois dispositivos estão editando a nota N. Acompanhe esta sequência:

| Operação | O que é enviado | Resultado |
|---|---|---|
| O1 | Base 0, texto “início” | Cria N na revisão 1. |
| O2 | Base 1, texto “edição A” | Atualiza N para a revisão 2. |
| O3 | Base 1, texto “edição B” | Conflito: N continua com “edição A”. |
| Reenvio de O2 | Mesmo conteúdo de antes | Repete o recibo de sucesso da revisão 2, sem aplicar outra alteração. |
| O4 | Base 2, texto “A + B” | Atualiza N para a revisão 3. |

Se O3 for reenviada, seu recibo ainda mostra o conflito original com a revisão 2. Já uma consulta à nota mostra a revisão 3. Reutilizar O2 com outro texto deve dar erro.

## Como organizar seu tempo

Nossa sugestão é dedicar até quatro horas à implementação, aos testes e à documentação. Se não conseguir terminar tudo nesse tempo, envie o que fez e conte o que ficou pendente. O objetivo é ter uma solução pequena que sirva de ponto de partida para nossa conversa.

## Ferramentas e uso de IA

Use a linguagem e as ferramentas com que se sente mais à vontade. A solução pode ser uma interface, API, aplicação de terminal, biblioteca com exemplo executável ou simulador. Escolha a forma que melhor combina com seu foco, seja front, mobile, back, arquitetura, algoritmos ou dados.

As regras do desafio valem para qualquer abordagem, mas você tem liberdade para decidir como organizar e apresentar a solução. Não é necessário publicar a aplicação, pagar por serviços ou usar hardware. Se depender de um serviço externo, ofereça uma forma local de demonstrar o funcionamento.

Pode usar IA, documentação e bibliotecas. Conte como essas ferramentas ajudaram, o que você aproveitou ou mudou e como conferiu o resultado. Não precisamos do histórico de conversas com a IA, pois queremos conhecer suas decisões e a maneira como você verificou o código.

## O que entregar

A entrega tem duas partes:

- **Um repositório Git com o código, os testes e a documentação da solução.** O README deve explicar como instalar o que for necessário, executar a aplicação e rodar os testes. Inclua uma demonstração que possamos reproduzir, suas principais decisões e o que ficou pendente.
- **Um vídeo de até 30 minutos explicando a solução.** Mostre a aplicação funcionando, percorra os trechos de código mais importantes e conte por que escolheu essa abordagem.

### Repositório e documentação

Crie o repositório no serviço de sua preferência. No README, informe o nome ou número do caso, o foco escolhido e quanto tempo você dedicou ao trabalho. Quem clonar o projeto deve conseguir acompanhar a demonstração com as instruções que você deixou.

Ao explicar os testes, destaque até três situações que ajudem a entender sua solução, como um valor no limite de uma regra, a interação entre duas regras ou uma entrada inválida. Conte o resultado esperado e que tipo de erro cada teste ajuda a encontrar. Você pode escrever outros testes, sem precisar atingir um percentual de cobertura.

Conte também duas decisões que tomou durante o trabalho, explicando o que queria conferir, como investigou e o que concluiu. Uma delas pode ser sobre uma sugestão da IA, se você a usou. Essas notas podem ficar no próprio README e não precisam seguir um formulário.

Use dados fictícios e deixe de fora credenciais, dados pessoais reais e código de empregadores. A quantidade de commits não conta na avaliação.

### Vídeo explicando a solução

A gravação deve nos ajudar a acompanhar seu raciocínio. Escolha um cenário diferente do exemplo deste documento, explique o resultado que espera e execute a solução para compará-lo com o que aconteceu. Mostre também um teste importante e o trecho de código que ele ajuda a conferir.

Ao percorrer o projeto, conte por que escolheu uma abordagem, que alternativa considerou e onde a solução tem limites. Se algo não funcionou, vale mostrar como investigou.

Não precisa mostrar o rosto, criar slides, editar a gravação ou repetir seu currículo. Use o tempo para explicar o trabalho, incluindo como verificou as sugestões da IA, quando houver. Se precisar de outro formato de apresentação, converse com a pessoa que acompanha seu processo.

## Como enviar

Quando estiver pronto, responda pelo mesmo canal em que recebeu o convite, compartilhando:

- O link do repositório e o hash completo do commit que devemos avaliar.
- O link do vídeo, que também pode ficar no README.
- O nome ou número do caso, o foco escolhido e o tempo aproximado utilizado.
- Alguma observação necessária para executar a solução, se houver.

O repositório pode ser privado. Nesse caso, peça à pessoa responsável os usuários que devem receber acesso de leitura. Confira também se conseguimos abrir o vídeo, sem enviar senhas ou tokens. Vamos confirmar o recebimento e o acesso aos arquivos.

O commit identifica o código entregue. Se continuar trabalhando e quiser incluir uma mudança na avaliação, basta avisar e enviar o novo hash. Você também pode corrigir links, permissões e instruções de execução depois do envio.