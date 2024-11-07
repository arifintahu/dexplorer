import React, { ReactNode, useEffect, useState } from 'react'
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Image,
  HStack,
} from '@chakra-ui/react'
import { MdOutlineHome } from 'react-icons/md'
import { FiMenu } from 'react-icons/fi'
import { IconType } from 'react-icons'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { selectSubsNewBlock, selectSubsTxEvent } from '@/store/streamSlice'
import { useSelector } from 'react-redux'
import { LS_RPC_ADDRESS, LS_RPC_ADDRESS_LIST } from '@/utils/constant'
import { images } from '@/utils/images'
import { HiOutlineUsers } from 'react-icons/hi2'
import { GiTwoCoins } from 'react-icons/gi'
import { PiTreeStructure, PiDevToLogoFill } from 'react-icons/pi'
import { FaGlobeAmericas } from 'react-icons/fa'
import { IoLogoGithub } from 'react-icons/io'
import { VscGlobe } from 'react-icons/vsc'

import { AiFillExclamationCircle } from 'react-icons/ai'

interface LinkItemProps {
  name: string
  icon: IconType
  route: string
  isBlank?: boolean
}
interface RefLinkItemProps {
  icon: IconType
  route: string
  isBlank?: boolean
  iconColor?: boolean
}
const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', icon: MdOutlineHome, route: '/' },
  { name: 'Transactions', icon: GiTwoCoins, route: '/txs' },
  { name: 'Validators', icon: HiOutlineUsers, route: '/validators' },
  { name: 'Aggregation', icon: PiTreeStructure, route: '/aggregation' },
  { name: 'Signers', icon: FaGlobeAmericas, route: '/signer' },
  {
    name: 'Bitcoin Playground',
    icon: PiDevToLogoFill,
    route: '/bitcoin-playground',
  },
]
const RefLinkItems: Array<RefLinkItemProps> = [
  {
    icon: IoLogoGithub,
    route: 'https://github.com/surgebuild',
    isBlank: true,
  },
  {
    icon: VscGlobe,
    route: 'https://surge.build/',
    isBlank: true,
  },
  {
    icon: AiFillExclamationCircle,
    route: 'https://surge.build/',
    isBlank: true,
    iconColor: true,
  },
]

export default function Sidebar({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box minH="100vh" bg={'dark-bg'}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>

      <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 80 }}>{children}</Box>
    </Box>
  )
}

interface SidebarProps extends BoxProps {
  onClose: () => void
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const subsNewBlock = useSelector(selectSubsNewBlock)
  const subsTxEvent = useSelector(selectSubsTxEvent)

  const handleDisconnect = () => {
    subsNewBlock?.unsubscribe()
    subsTxEvent?.unsubscribe()
    window.localStorage.removeItem(LS_RPC_ADDRESS)
    window.localStorage.removeItem(LS_RPC_ADDRESS_LIST)
    window.location.replace('/')
  }

  return (
    <Box
      bg={'dark-bg'}
      borderRight="1px"
      borderRightColor={'border-gray-900'}
      w={{ base: 'full', md: 80 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex flexDirection="column" h="full" justifyContent="space-between">
        <Box>
          <Flex
            h="20"
            alignItems="center"
            mx="8"
            justifyContent="space-between"
          >
            <Image src={images.logo.src} alt="logo" />

            <CloseButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onClose}
            />
          </Flex>
          {LinkItems.map((link) => (
            <NavItem key={link.name} icon={link.icon} route={link.route}>
              {link.name}
            </NavItem>
          ))}
        </Box>
        <Flex justifyContent="center" mb="10">
          {/* <Button
            leftIcon={<FiLogOut />}
            colorScheme="red"
            variant="outline"
            onClick={handleDisconnect}
          >
            Disconnect All
          </Button> */}
          <HStack spacing="20px">
            {RefLinkItems.map((link, key) => (
              <RefLinkItem
                key={key}
                icon={link.icon}
                route={link.route}
                isBlank={link.isBlank}
                iconColor={link.iconColor}
              />
            ))}
          </HStack>
        </Flex>
      </Flex>
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  icon: IconType
  children?: string | number
  route: string
  isBlank?: boolean
}
const NavItem = ({ icon, children, route, isBlank, ...rest }: NavItemProps) => {
  const router = useRouter()
  const [isSelected, setIsSelected] = useState(false)

  useEffect(() => {
    if (route === '/') {
      setIsSelected(router.route === route)
    } else {
      setIsSelected(router.route.includes(route))
    }
  }, [router])

  return (
    <Link
      as={NextLink}
      href={route}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      target={isBlank ? '_blank' : '_self'}
      mb={'3'}
      display={'block'}
    >
      <Flex
        className={`${isSelected ? 'primary_gradient' : ''}`}
        align="center"
        px="4"
        py="3"
        mx="8"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        color={isSelected ? 'white' : 'text-gray-500'}
        fontWeight={isSelected ? 'bold' : 'medium'}
        _hover={{
          color: isSelected ? 'white' : 'dark-theme',
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="2"
            fontSize="22"
            _groupHover={{
              color: isSelected ? 'white' : 'dark-theme',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}

interface RefLinkItemProps extends FlexProps {
  icon: IconType
  children?: string | number
  route: string
  iconColor?: boolean
  isBlank?: boolean
}
const RefLinkItem = ({
  icon,
  children,
  route,
  isBlank,
  iconColor,
  ...rest
}: RefLinkItemProps) => {
  const router = useRouter()
  const [isSelected, setIsSelected] = useState(false)

  useEffect(() => {
    if (route === '/') {
      setIsSelected(router.route === route)
    } else {
      setIsSelected(router.route.includes(route))
    }
  }, [router])

  return (
    <Link
      as={NextLink}
      href={route}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      target={isBlank ? '_blank' : '_self'}
      display={'block'}
    >
      {icon && (
        <Icon
          color={iconColor ? '#F66949' : 'text-gray-500'}
          _hover={{
            color: 'primary-400',
          }}
          cursor="pointer"
          fontSize="22"
          as={icon}
        />
      )}
    </Link>
  )
}

interface MobileProps extends FlexProps {
  onOpen: () => void
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('light-container', 'dark-container')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent="flex-start"
      {...rest}
    >
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text fontSize="2xl" ml="8" fontFamily="monospace" fontWeight="bold">
        Surge Explorer
      </Text>
    </Flex>
  )
}
