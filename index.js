const { select, input, checkbox } = require('@inquirer/prompts')
const fs = require("fs").promises

let mensagem = 'Bem vindo ao app de metas!'

let metas

const carregarMetas = async () => {
  try {
    const dados = await fs.readFile("metas.json", "utf-8")
    metas = JSON.parse(dados)
  }
  catch(erro) {
    metas = []
  }
}

const salvarMetas = async () => {
  await fs.writeFile("metas.json", JSON.stringify(metas,null,2))
}

const cadastrarMeta = async () => {
  const meta = await input( {message: "Digite a meta:"})

  if(meta.length == 0) {
    mensagem = 'A meta não pode ser vazia.'
    return
  }

  metas.push({value: meta, checked: false})
  mensagem = 'A meta foi adicionada com sucesso.'
}

const listarMeta = async () => {

  if(metas.length == 0 ) {
    mensagem = "Não existe nenhuma meta!"
    return
  }

  const respostas = await checkbox({
    message: "Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o Enter para finalizar essa etapa",
    choices: [...metas],
    instructions: false,
  })

  metas.forEach((m) => {
    m.checked = false
  })

  if(respostas.length == 0 ) {
    mensagem = "Nenhuma meta selecionada!"
    return
  }

  respostas.forEach((resposta) => {
    const meta = metas.find((m) => {
      return m.value == resposta 
    })

    meta.checked = true
    mensagem = "Meta(s) marcada(s) como concluídas"
  })
}

const metasRealizadas = async () => {
  if(metas.length == 0 ) {
    mensagem = "Não existe nenhuma meta!"
    return
  }
  const realizadas = metas.filter((meta) => {
    return meta.checked
  })

  if(realizadas.length == 0) {
    mensagem = 'Não existem metas realizadas! :('
    return
  }

  await select({
    message: "Metas Realizadas",
    choices: [...realizadas]
  })

}

const metasAbertas = async () => {
  if(metas.length == 0 ) {
    mensagem = "Não existe nenhuma meta!"
    return
  }
  const abertas = metas.filter((meta) => {
    return meta.checked != true
  })

  if(abertas.length == 0) {
    mensagem = 'Não existem metas abertas! :)'
    return
  }

  await select({
    message: "Metas Abertas",
    choices: [...abertas]
  })

}

const deletarMetas = async () => {
  if(metas.length == 0 ) {
    mensagem = "Não existe nenhuma meta!"
    return
  }
  const metasDesmarcadas = metas.map((meta) => {
    return {value: meta.value, checked: false}
  })

  const itensADeletar = await checkbox({
    message: "Selecione item para deletar", 
    choices: [...metasDesmarcadas],
    instructions: false,
  })

  if(itensADeletar.length == 0) {
    mensagem = 'Nenhum item para deletar!'
  }

  itensADeletar.forEach((item) => {
    metas = metas.filter((meta) => {
      return meta.value != item
    })
  })

  mensagem = "Meta(s) deleteda(s) com sucesso!"
}

const mostrarMensagem = () => {
  console.clear()

  if(mensagem != "") {
    console.log(mensagem)
    console.log("")
    mensagem = ""
  }
}

const start = async () => {
  await carregarMetas()

  while(true){
    mostrarMensagem()
    await salvarMetas()

    const opcao = await select({
      message: "Menu >",
      choices: [
        {
          name: "Cadastrar meta", 
          value: "cadastrar"
        },
        {
          name: "Listar metas",
          value: "listar"
        },
        {
          name: "Metas realizadas",
          value: "metasRealizadas"
        },
        {
          name: "Metas abertas",
          value: "metasAbertas"
        },
        {
          name: "Deletar metas",
          value: "deletarMetas"
        },
        {
          name: "Sair",
          value: "sair"
        }
      ]
    })

    switch(opcao){
      case "cadastrar":
        await cadastrarMeta()
        console.log(metas)
        break
      case "listar":
        await listarMeta()
        break
      case "metasRealizadas":
        await metasRealizadas()
        break
      case "metasAbertas":
        await metasAbertas()
        break
      case "deletarMetas":
        await deletarMetas()
        break
      case "sair":
        console.log("Até a próxima!")
        return
    }
  }
}

start()