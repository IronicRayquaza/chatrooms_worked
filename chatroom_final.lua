Members = Members or {}
Messages = Messages or {}

Handlers.add(
  "Register",
  { Action = "Register"},
  function (msg)
    table.insert(Members, msg.From)
    print(msg.From .. " Registered")
    msg.reply({ Data = "Registered." })
  end
)

Handlers.add(
  "Broadcast",
  { Action = "Broadcast" },
  function (msg)
    -- Store the message
    table.insert(Messages, {
      from = msg.From,
      text = msg.Data,
      timestamp = os.time()
    })
    
    -- Broadcast to all members
    for _, recipient in ipairs(Members) do
      if recipient ~= msg.From then  -- Don't send back to sender
        ao.send({
          Target = recipient,
          Action = "Broadcast",
          From = msg.From,
          Data = msg.Data
        })
      end
    end
    
    -- Send confirmation back to sender
    msg.reply({
      Action = "Broadcast",
      From = msg.From,
      Data = msg.Data
    })
  end
)

Handlers.add(
  "ViewMessages",
  "ViewMessages",
  function (msg)
    msg.reply({ Data = Messages })
  end
)

Handlers.add(
  "handleMessage",
  "handleMessage",
  function (msg)
    table.insert(Messages, msg.Data)
    msg.reply({ Data = "Message handled." })
  end
)

Handlers.add(
  "fetchHistory",
  function (msg)
    msg.reply({ Data = Messages })
  end
)

Handlers.add(
  "updateSettings",
  function (msg)
    -- Handle user settings updates
    msg.reply({ Data = "Settings updated." })
  end
)

Handlers.add(
  "handleDisconnect",
  function (msg)
    for i, member in ipairs(Members) do
      if member == msg.From then
        table.remove(Members, i)
        break
      end
    end
    msg.reply({ Data = "Disconnected." })
  end
)

Handlers.add(
  "getChatMessages",
  function (msg)
    msg.reply({ Data = Messages })
  end
)

Handlers.add(
  "broadcastNewMessage",
  "broadcastNewMessage",
  function (msg)
    table.insert(Messages, msg.Data)
    for _, recipient in ipairs(Members) do
      if recipient ~= msg.From then  -- Don't send back to sender
        ao.send({
          Target = recipient,
          Action = "Broadcast",
          From = msg.From,
          Data = msg.Data
        })
      end
    end
    msg.reply({Data = "Message broadcasted." })
  end
)

Handlers.add(
  "getCurrentUsers",
  function (msg)
    msg.reply({ Data = Members })
  end
)

Handlers.add(
  "userHeartbeat",
  function (msg)
    msg.reply({ Data = "Alive" })
  end
) 