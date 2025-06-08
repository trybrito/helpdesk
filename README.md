# HelpDesk

## Domínio - Gestão de chamados (contexto)

### Subdomínios
#### - Pagamento
#### - Faturamento
#### - Chamados
#### - Serviços

### Domain Experts (especialista no domínio do aplicação - pessoas que operam e conhecem a camada de domínio do negócio)

### Entidades (atores em cada subdomínio) e Casos de Uso

#### Entidades

#### - User -> representação genérica de um usuário (centraliza dados iguais entre cada ator da aplicação, o que permite extensividade e reduz a repetição de código)
#### - Customer -> representação do cliente e seus dados pertinentes a nível de domínio (nome e id do usuário - entidade)
#### - Technician -> representação do técnico e seus dados pertinentes a nível de domínio (nome, id do usuário - entidade, id do admin - responsável pela criação da conta do técnico, deve atualizar a senha - campo booleano para sinalização de um técnico que está acessando a aplicação pela primeira vez (ou após reset de senha))
#### - Admin -> representação do administrador e seus dados pertinentes a nível de domínio (nome e id do usuário - entidade)
#### - Service -> representação do serviço que será prestado e seus dados
#### - Category -> representação da categoria de um serviços e seus dados
#### - Ticket -> representação do chamado e seus dados
#### - Interaction -> representação da categoria de um serviços e seus dados
#### - Observation -> representação de uma observação adicionado a um chamado criado e seus dados
#### - BillingItem -> representação de cada item adicionado à fatura e seus dados
#### - Billing -> representação da fatura atrelada à um chamado
